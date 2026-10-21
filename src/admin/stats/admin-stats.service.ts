// src/admin/admin-stats.service.ts
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

    const actifs = raw.emetteursParActif.find((r) => r.actif === true)?._count ?? 0;
    const inactifs = raw.emetteursParActif.find((r) => r.actif === false)?._count ?? 0;

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
        actifs,
        inactifs,
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
