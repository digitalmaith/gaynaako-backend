// src/auth/repositories/utilisateur.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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

@Injectable()
export class UtilisateurRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.utilisateur.findUnique({ where: { email } });
  }

  findByEmailWithProfile(email: string) {
    return this.prisma.utilisateur.findUnique({
      where: { email },
      include: PROFILE_INCLUDE,
    });
  }

  findById(id: string) {
    return this.prisma.utilisateur.findUnique({ where: { id } });
  }

  findByIdWithProfile(id: string) {
    return this.prisma.utilisateur.findUnique({
      where: { id },
      include: PROFILE_INCLUDE,
    });
  }

  updateMotDePasse(email: string, motDePasse: string) {
    return this.prisma.utilisateur.update({
      where: { email },
      data: { motDePasse },
    });
  }

  async createWithProfile(email: string, motDePasse: string, input: ProfileInput) {
    return this.prisma.$transaction(async (tx) => {
      const utilisateur = await tx.utilisateur.create({
        data: { email, motDePasse, role: input.role },
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
                connect: input.profile.domaineInterventionIds.map((id) => ({
                  id,
                })),
              },
            },
          });
          break;
      }

      return utilisateur;
    });
  }
}
