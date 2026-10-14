import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StatutCandidature } from '../../generated/prisma/enums';

export interface ListCandidaturesFilters {
  utilisateurId: string;
  statut?: StatutCandidature;
  skip: number;
  take: number;
}

@Injectable()
export class CandidatureRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Détail d'une candidature avec son opportunité et le score de matching.
   */
  async findById(id: string) {
    const candidature = await this.prisma.candidature.findUnique({
      where: { id },
      include: { opportunite: true },
    });

    if (!candidature) return null;

    const reco = await this.prisma.recommandation.findFirst({
      where: {
        utilisateurId: candidature.utilisateurId,
        opportunityProcessedId: candidature.opportuniteId,
      },
      select: { scorePertinence: true },
    });

    return {
      ...candidature,
      scoreMatching: reco?.scorePertinence ?? null,
    };
  }

  findByUtilisateurEtOpportunite(utilisateurId: string, opportuniteId: string) {
    return this.prisma.candidature.findUnique({
      where: { utilisateurId_opportuniteId: { utilisateurId, opportuniteId } },
    });
  }

  private buildWhere(filters: Pick<ListCandidaturesFilters, 'utilisateurId' | 'statut'>) {
    return {
      utilisateurId: filters.utilisateurId,
      ...(filters.statut ? { statut: filters.statut } : {}),
    };
  }

  /**
   * Liste paginée avec, pour chaque candidature, le score de matching
   * récupéré en une seule requête (batch).
   */
  async findManyPaginated(filters: ListCandidaturesFilters) {
    const where = this.buildWhere(filters);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.candidature.findMany({
        where,
        include: { opportunite: true },
        orderBy: { dateCreation: 'desc' },
        skip: filters.skip,
        take: filters.take,
      }),
      this.prisma.candidature.count({ where }),
    ]);

    // Récupérer tous les scores en une seule requête
    const opportuniteIds = items.map((c) => c.opportuniteId);
    const recos = opportuniteIds.length
      ? await this.prisma.recommandation.findMany({
          where: {
            utilisateurId: filters.utilisateurId,
            opportunityProcessedId: { in: opportuniteIds },
          },
          select: {
            opportunityProcessedId: true,
            scorePertinence: true,
          },
        })
      : [];

    const scoreMap = new Map(recos.map((r) => [r.opportunityProcessedId, r.scorePertinence]));

    const itemsWithScore = items.map((c) => ({
      ...c,
      scoreMatching: scoreMap.get(c.opportuniteId) ?? null,
    }));

    return { items: itemsWithScore, total };
  }

  async create(utilisateurId: string, opportuniteId: string) {
    const candidature = await this.prisma.candidature.create({
      data: { utilisateurId, opportuniteId },
      include: { opportunite: true },
    });

    const reco = await this.prisma.recommandation.findFirst({
      where: {
        utilisateurId,
        opportunityProcessedId: opportuniteId,
      },
      select: { scorePertinence: true },
    });

    return {
      ...candidature,
      scoreMatching: reco?.scorePertinence ?? null,
    };
  }

  async updateStatut(id: string, statut: StatutCandidature, dateSoumission?: Date) {
    const candidature = await this.prisma.candidature.update({
      where: { id },
      data: {
        statut,
        ...(dateSoumission ? { dateSoumission } : {}),
      },
      include: { opportunite: true },
    });

    const reco = await this.prisma.recommandation.findFirst({
      where: {
        utilisateurId: candidature.utilisateurId,
        opportunityProcessedId: candidature.opportuniteId,
      },
      select: { scorePertinence: true },
    });

    return {
      ...candidature,
      scoreMatching: reco?.scorePertinence ?? null,
    };
  }

  delete(id: string) {
    return this.prisma.candidature.delete({ where: { id } });
  }
}
