// src/admin/admin-stats.service.ts (ou src/admin/stats/admin-stats.service.ts selon ton arborescence)
import { Injectable } from '@nestjs/common';
import { StatsRepository } from '../repositories/stats.repository';

@Injectable()
export class AdminStatsService {
  constructor(private readonly statsRepository: StatsRepository) {}

  private toCountMap<K extends string>(
    rows: (Record<K, string> & { _count: unknown })[],
    key: K,
  ): Record<string, number> {
    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row[key]] = row._count as number;
      return acc;
    }, {});
  }

  async getOverview() {
    const raw = await this.statsRepository.getOverview();

    return {
      utilisateurs: {
        total: raw.totalUtilisateurs,
        supprimes: raw.totalUtilisateursSupprimes,
        parRole: this.toCountMap(raw.utilisateursParRole, 'role'),
        parStatut: this.toCountMap(raw.utilisateursParStatut, 'statut'),
        nouveauxDerniers7Jours: raw.inscriptions7j,
        nouveauxDerniers30Jours: raw.inscriptions30j,
      },
      emetteurs: {
        total: raw.totalEmetteurs,
        parStatut: this.toCountMap(raw.emetteursParStatut, 'statut'),
      },
      opportunites: {
        total: raw.totalOpportunites,
      },
      candidatures: {
        total: raw.totalCandidatures,
        parStatut: this.toCountMap(raw.candidaturesParStatut, 'statut'),
      },
      favoris: {
        total: raw.totalFavoris,
      },
      recommandations: {
        total: raw.totalRecommandations,
      },
    };
  }
}
