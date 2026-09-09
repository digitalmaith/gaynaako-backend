// src/auth/repositories/utilisateur.repository.ts
import { Injectable } from '@nestjs/common';
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

type ProfileInput =
  | { role: 'ENTREPRENEUR'; profile: EntrepreneurProfileInput }
  | { role: 'PME'; profile: PmeProfileInput }
  | { role: 'ONG'; profile: OngProfileInput };

const PROFILE_INCLUDE = {
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
} as const;

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

  findByEmail(email: string) {
    return this.prisma.utilisateur.findUnique({ where: { email, supprimeLe: null } });
  }

  findByEmailWithProfile(email: string) {
    return this.prisma.utilisateur.findUnique({
      where: { email, supprimeLe: null },
      include: PROFILE_INCLUDE,
    });
  }

  findById(id: string) {
    return this.prisma.utilisateur.findUnique({ where: { id, supprimeLe: null } });
  }

  findByIdWithProfile(id: string) {
    return this.prisma.utilisateur.findUnique({
      where: { id, supprimeLe: null },
      include: PROFILE_INCLUDE,
    });
  }

  findAdministrateurProfileByUtilisateurId(utilisateurId: string) {
    return this.prisma.administrateurProfile.findUnique({
      where: { utilisateurId },
    });
  }

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

  private buildWhere(
    filters: Pick<ListUsersFilters, 'role' | 'statut' | 'search' | 'inclureSupprimes'>,
  ) {
    return {
      ...(filters.inclureSupprimes ? {} : { supprimeLe: null }),
      ...(filters.role ? { role: filters.role } : {}),
      ...(filters.statut ? { statut: filters.statut } : {}),
      ...(filters.search
        ? { email: { contains: filters.search, mode: 'insensitive' as const } }
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

  async createWithProfile(
    email: string,
    motDePasse: string,
    nom: string,
    prenom: string,
    input: ProfileInput,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const utilisateur = await tx.utilisateur.create({
        data: { email, motDePasse, nom, prenom, role: input.role },
      });

      // ... switch inchangé pour la création du profil spécialisé

      return utilisateur;
    });
  }

  findByIdIncludingDeleted(id: string) {
    return this.prisma.utilisateur.findUnique({
      where: { id },
      include: PROFILE_INCLUDE,
    });
  }

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
    data: { nomEntreprise?: string; secteurIds?: string[]; logoUrl?: string },
  ) {
    const { secteurIds, ...rest } = data;
    return this.prisma.pmeProfile.update({
      where: { utilisateurId },
      data: {
        ...rest,
        ...(secteurIds ? { secteurs: { set: secteurIds.map((id) => ({ id })) } } : {}),
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
          ? { domainesIntervention: { set: domaineInterventionIds.map((id) => ({ id })) } }
          : {}),
      },
      include: { domainesIntervention: true },
    });
  }

  updateIdentity(id: string, data: { nom?: string; prenom?: string }) {
    return this.prisma.utilisateur.update({ where: { id }, data });
  }
}
