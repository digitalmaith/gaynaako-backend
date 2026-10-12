import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ListRecommandationsFilters {
  utilisateurId: string;
  minScore?: number;
  skip: number;
  take: number;
}

@Injectable()
export class RecommandationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByUtilisateur(filters: ListRecommandationsFilters) {
    const where = {
      utilisateurId: filters.utilisateurId,
      ...(filters.minScore !== undefined ? { scorePertinence: { gte: filters.minScore } } : {}),
    };

    return this.prisma.recommandation.findMany({
      where,
      include: { opportunityProcessed: true },
      orderBy: { scorePertinence: 'desc' },
      skip: filters.skip,
      take: filters.take,
    });
  }

  countByUtilisateur(utilisateurId: string, minScore?: number) {
    return this.prisma.recommandation.count({
      where: {
        utilisateurId,
        ...(minScore !== undefined ? { scorePertinence: { gte: minScore } } : {}),
      },
    });
  }
}
