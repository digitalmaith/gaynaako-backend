import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleUtilisateur, StatutUtilisateur } from '../../generated/prisma/enums';

interface EntrepreneurProfileInput {
  secteurId: string;
  paysId: string;
  domaineExpertise: string;
  objectifs?: string;
}

interface PmeProfileInput {
  nomEntreprise: string;
  secteurIds: string[];
  logoUrl?: string;
}

interface OngProfileInput {
  nomOrganisation: string;
  domaineInterventionIds: string[];
  mission?: string;
  logoUrl?: string;
}

interface AdministrateurProfileInput {
  niveauAcces?: string;
}

type ProfileInput =
  | { role: 'ENTREPRENEUR'; profile: EntrepreneurProfileInput }
  | { role: 'PME'; profile: PmeProfileInput }
  | { role: 'ONG'; profile: OngProfileInput }
  | { role: 'ADMINISTRATEUR'; profile: AdministrateurProfileInput };

const PROFILE_INCLUDE: Prisma.UtilisateurInclude = {
  entrepreneur: {
    include: { secteur: true, pays: true },
  },
  pme: {
    include: { secteurs: true },
  },
  ong: {
    include: { domainesIntervention: true },
  },
  administrateur: true,
};

/**
 * Include complet pour la page profil (/users/me) :
 * - profil + relations
 * - documents (triés par date)
 * - abonnement actif (1 seul, le plus récent)
 */
const FULL_PROFILE_INCLUDE = {
  ...PROFILE_INCLUDE,
  documents: {
    orderBy: { dateAjout: 'desc' },
  },
  abonnements: {
    where: {
      statut: 'ACTIF',
      OR: [{ dateFin: null }, { dateFin: { gt: new Date() } }],
    },
    include: { plan: true },
    orderBy: { dateCreation: 'desc' },
    take: 1,
  },
} satisfies Prisma.UtilisateurInclude;

export interface ListUsersFilters {
  role?: RoleUtilisateur;
  statut?: StatutUtilisateur;
  search?: string;
  inclureSupprimes?: boolean;
  skip: number;
  take: number;
}

@Injectable()
export class UtilisateurRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── READ ─────────────────────────────────────────────────

  findByEmail(email: string) {
    return this.prisma.utilisateur.findUnique({
      where: { email, supprimeLe: null },
    });
  }

  findByEmailWithProfile(email: string) {
    return this.prisma.utilisateur.findUnique({
      where: { email, supprimeLe: null },
      include: PROFILE_INCLUDE,
    });
  }

  findById(id: string) {
    return this.prisma.utilisateur.findUnique({
      where: { id, supprimeLe: null },
    });
  }

  findByIdWithProfile(id: string) {
    return this.prisma.utilisateur.findUnique({
      where: { id, supprimeLe: null },
      include: PROFILE_INCLUDE,
    });
  }

  /**
   * Profil complet pour la page /users/me :
   * - profil (entrepreneur/pme/ong/admin)
   * - documents
   * - abonnement actif + plan
   * - statistiques (counts) + stats spécifiques admin
   */
  async findByIdWithFullProfile(id: string) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id, supprimeLe: null },
      include: FULL_PROFILE_INCLUDE,
    });

    if (!user) return null;

    const [candidatures, favoris, recommandations, documentsCount] = await Promise.all([
      this.prisma.candidature.count({ where: { utilisateurId: id } }),
      this.prisma.favori.count({ where: { utilisateurId: id } }),
      this.prisma.recommandation.count({ where: { utilisateurId: id } }),
      this.prisma.documentUtilisateur.count({ where: { utilisateurId: id } }),
    ]);

    let extraAdminStats: { opportunitesGerees: number; utilisateursGeres: number } | null = null;

    if (user.role === 'ADMINISTRATEUR' && user.administrateur) {
      const [opportunitesGerees, utilisateursGeres] = await Promise.all([
        this.prisma.opportunite.count({
          where: { administrateurId: user.administrateur.id },
        }),
        this.prisma.utilisateur.count({ where: { supprimeLe: null } }),
      ]);
      extraAdminStats = { opportunitesGerees, utilisateursGeres };
    }

    return {
      ...user,
      statistiques: {
        candidatures,
        favoris,
        recommandations,
        documents: documentsCount,
        ...(extraAdminStats ?? {}),
      },
    };
  }

  findAdministrateurProfileByUtilisateurId(utilisateurId: string) {
    return this.prisma.administrateurProfile.findUnique({
      where: { utilisateurId },
    });
  }

  findByIdIncludingDeleted(id: string) {
    return this.prisma.utilisateur.findUnique({
      where: { id },
      include: PROFILE_INCLUDE,
    });
  }

  // ─── UPDATE ───────────────────────────────────────────────

  updateMotDePasse(email: string, motDePasse: string) {
    return this.prisma.utilisateur.update({
      where: { email },
      data: { motDePasse },
    });
  }

  updateStatut(id: string, statut: StatutUtilisateur) {
    return this.prisma.utilisateur.update({
      where: { id },
      data: { statut },
      include: PROFILE_INCLUDE,
    });
  }

  updateIdentity(id: string, data: { nom?: string; prenom?: string; telephone?: string }) {
    return this.prisma.utilisateur.update({
      where: { id },
      data,
    });
  }

  updateAvatar(id: string, avatarUrl: string) {
    return this.prisma.utilisateur.update({
      where: { id },
      data: { avatarUrl },
    });
  }

  updateTelephone(id: string, telephone: string | null) {
    return this.prisma.utilisateur.update({
      where: { id },
      data: { telephone },
    });
  }

  updateEntrepreneurLogo(utilisateurId: string, logoUrl: string) {
    return this.prisma.entrepreneurProfile.update({
      where: { utilisateurId },
      data: { logoUrl },
    });
  }

  // ─── DELETE / RESTORE ──────────────────────────────────────

  deleteById(id: string) {
    return this.prisma.utilisateur.delete({ where: { id } });
  }

  softDelete(id: string) {
    return this.prisma.utilisateur.update({
      where: { id },
      data: { supprimeLe: new Date() },
    });
  }

  restore(id: string) {
    return this.prisma.utilisateur.update({
      where: { id },
      data: { supprimeLe: null },
      include: PROFILE_INCLUDE,
    });
  }

  // ─── LISTE ────────────────────────────────────────────────

  private buildWhere(
    filters: Pick<ListUsersFilters, 'role' | 'statut' | 'search' | 'inclureSupprimes'>,
  ): Prisma.UtilisateurWhereInput {
    return {
      ...(filters.inclureSupprimes ? {} : { supprimeLe: null }),
      ...(filters.role ? { role: filters.role } : {}),
      ...(filters.statut ? { statut: filters.statut } : {}),
      ...(filters.search
        ? {
            email: {
              contains: filters.search,
            },
          }
        : {}),
    };
  }

  async findManyPaginated(filters: ListUsersFilters) {
    const where = this.buildWhere(filters);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.utilisateur.findMany({
        where,
        include: PROFILE_INCLUDE,
        orderBy: { dateCreation: 'desc' },
        skip: filters.skip,
        take: filters.take,
      }),
      this.prisma.utilisateur.count({ where }),
    ]);

    return { items, total };
  }

  // ─── CREATE ───────────────────────────────────────────────

  async createWithProfile(
    email: string,
    motDePasse: string,
    nom: string,
    prenom: string,
    input: ProfileInput,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const utilisateur = await tx.utilisateur.create({
        data: {
          email,
          motDePasse,
          nom,
          prenom,
          role: input.role,
        },
      });

      switch (input.role) {
        case 'ENTREPRENEUR':
          await tx.entrepreneurProfile.create({
            data: {
              utilisateurId: utilisateur.id,
              secteurId: input.profile.secteurId,
              paysId: input.profile.paysId,
              domaineExpertise: input.profile.domaineExpertise,
              objectifs: input.profile.objectifs,
            },
          });
          break;

        case 'PME':
          await tx.pmeProfile.create({
            data: {
              utilisateurId: utilisateur.id,
              nomEntreprise: input.profile.nomEntreprise,
              logoUrl: input.profile.logoUrl,
              secteurs: {
                connect: input.profile.secteurIds.map((id) => ({ id })),
              },
            },
          });
          break;

        case 'ONG':
          await tx.ongProfile.create({
            data: {
              utilisateurId: utilisateur.id,
              nomOrganisation: input.profile.nomOrganisation,
              mission: input.profile.mission,
              logoUrl: input.profile.logoUrl,
              domainesIntervention: {
                connect: input.profile.domaineInterventionIds.map((id) => ({ id })),
              },
            },
          });
          break;

        case 'ADMINISTRATEUR':
          await tx.administrateurProfile.create({
            data: {
              utilisateurId: utilisateur.id,
              niveauAcces: input.profile.niveauAcces ?? 'STANDARD',
            },
          });
          break;

        default:
          throw new Error('Rôle utilisateur invalide');
      }

      const utilisateurComplet = await tx.utilisateur.findUnique({
        where: { id: utilisateur.id },
        include: PROFILE_INCLUDE,
      });

      if (!utilisateurComplet) {
        throw new Error('Utilisateur créé mais impossible de récupérer son profil');
      }

      return utilisateurComplet;
    });
  }

  // ─── UPDATE PROFILS ───────────────────────────────────────

  updateEntrepreneurProfile(
    utilisateurId: string,
    data: Partial<{
      secteurId: string;
      paysId: string;
      domaineExpertise: string;
      objectifs: string;
    }>,
  ) {
    return this.prisma.entrepreneurProfile.update({
      where: { utilisateurId },
      data,
      include: { secteur: true, pays: true },
    });
  }

  updatePmeProfile(
    utilisateurId: string,
    data: {
      nomEntreprise?: string;
      secteurIds?: string[];
      logoUrl?: string;
    },
  ) {
    const { secteurIds, ...rest } = data;

    return this.prisma.pmeProfile.update({
      where: { utilisateurId },
      data: {
        ...rest,
        ...(secteurIds
          ? {
              secteurs: {
                set: secteurIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
      include: { secteurs: true },
    });
  }

  updateOngProfile(
    utilisateurId: string,
    data: {
      nomOrganisation?: string;
      domaineInterventionIds?: string[];
      mission?: string;
      logoUrl?: string;
    },
  ) {
    const { domaineInterventionIds, ...rest } = data;

    return this.prisma.ongProfile.update({
      where: { utilisateurId },
      data: {
        ...rest,
        ...(domaineInterventionIds
          ? {
              domainesIntervention: {
                set: domaineInterventionIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
      include: { domainesIntervention: true },
    });
  }
}
