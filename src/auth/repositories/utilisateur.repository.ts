// src/auth/repositories/utilisateur.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleUtilisateur } from '../../generated/prisma/enums';

interface EntrepreneurProfileInput {
  secteurActivite: string;
  pays: string;
  domaineExpertise: string;
  objectifs?: string;
}

interface PmeProfileInput {
  nomEntreprise: string;
  secteursActivite: string[];
  logoUrl?: string;
}

interface OngProfileInput {
  nomOrganisation: string;
  domainesIntervention: string[];
  mission?: string;
  logoUrl?: string;
}

type ProfileInput =
  | { role: 'ENTREPRENEUR'; profile: EntrepreneurProfileInput }
  | { role: 'PME'; profile: PmeProfileInput }
  | { role: 'ONG'; profile: OngProfileInput };

@Injectable()
export class UtilisateurRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.utilisateur.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.utilisateur.findUnique({ where: { id } });
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
        data: { email, motDePasse, role: input.role as RoleUtilisateur },
      });

      switch (input.role) {
        case 'ENTREPRENEUR':
          await tx.entrepreneurProfile.create({
            data: { utilisateurId: utilisateur.id, ...input.profile },
          });
          break;
        case 'PME':
          await tx.pmeProfile.create({
            data: { utilisateurId: utilisateur.id, ...input.profile },
          });
          break;
        case 'ONG':
          await tx.ongProfile.create({
            data: { utilisateurId: utilisateur.id, ...input.profile },
          });
          break;
      }

      return utilisateur;
    });
  }
}
