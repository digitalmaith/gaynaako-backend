// src/admin/repositories/stats.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const septJoursAvant = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const trenteJoursAvant = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUtilisateurs,
      utilisateursParRole,
      utilisateursParStatut,
      totalUtilisateursSupprimes,
      inscriptions7j,
      inscriptions30j,
      totalEmetteurs,
      emetteursParStatut,
      totalOpportunites,
      totalCandidatures,
      candidaturesParStatut,
      totalFavoris,
      totalRecommandations,
    ] = await this.prisma.$transaction([
      this.prisma.utilisateur.count({ where: { supprimeLe: null } }),
      this.prisma.utilisateur.groupBy({
        by: ['role'],
        where: { supprimeLe: null },
        _count: true,
        orderBy: { role: 'asc' },
      }),
      this.prisma.utilisateur.groupBy({
        by: ['statut'],
        where: { supprimeLe: null },
        _count: true,
        orderBy: { statut: 'asc' },
      }),
      this.prisma.utilisateur.count({ where: { supprimeLe: { not: null } } }),
      this.prisma.utilisateur.count({
        where: { supprimeLe: null, dateCreation: { gte: septJoursAvant } },
      }),
      this.prisma.utilisateur.count({
        where: { supprimeLe: null, dateCreation: { gte: trenteJoursAvant } },
      }),
      this.prisma.emetteur.count(),
      this.prisma.emetteur.groupBy({
        by: ['statut'],
        _count: true,
        orderBy: { statut: 'asc' },
      }),
      this.prisma.opportunite.count(),
      this.prisma.candidature.count(),
      this.prisma.candidature.groupBy({
        by: ['statut'],
        _count: true,
        orderBy: { statut: 'asc' },
      }),
      this.prisma.favori.count(),
      this.prisma.recommandation.count(),
    ]);

    return {
      totalUtilisateurs,
      utilisateursParRole,
      utilisateursParStatut,
      totalUtilisateursSupprimes,
      inscriptions7j,
      inscriptions30j,
      totalEmetteurs,
      emetteursParStatut,
      totalOpportunites,
      totalCandidatures,
      candidaturesParStatut,
      totalFavoris,
      totalRecommandations,
    };
  }
}
