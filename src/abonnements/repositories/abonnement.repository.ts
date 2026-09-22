// src/abonnements/repositories/abonnement.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CycleFacturation, StatutAbonnement } from '../../generated/prisma/enums';

@Injectable()
export class AbonnementRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActifByUtilisateur(utilisateurId: string) {
    return this.prisma.abonnement.findFirst({
      where: { utilisateurId, statut: StatutAbonnement.ACTIF, supprimeLe: null },
      include: { plan: { include: { fonctionnalites: true } } },
      orderBy: { dateCreation: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.abonnement.findUnique({
      where: { id },
      include: { plan: true, transactions: true },
    });
  }

  create(data: { utilisateurId: string; planId: string; cycle: CycleFacturation }) {
    return this.prisma.abonnement.create({ data });
  }

  updateStatut(id: string, statut: StatutAbonnement, data?: { dateDebut?: Date; dateFin?: Date }) {
    return this.prisma.abonnement.update({
      where: { id },
      data: { statut, ...data },
    });
  }

  softDelete(id: string) {
    return this.prisma.abonnement.update({
      where: { id },
      data: { supprimeLe: new Date(), renouvellementAuto: false },
    });
  }
}
