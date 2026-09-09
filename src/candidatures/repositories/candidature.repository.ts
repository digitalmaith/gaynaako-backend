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

  findById(id: string) {
    return this.prisma.candidature.findUnique({
      where: { id },
      include: { opportunite: { include: { secteur: true, emetteur: true } } },
    });
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

  async findManyPaginated(filters: ListCandidaturesFilters) {
    const where = this.buildWhere(filters);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.candidature.findMany({
        where,
        include: { opportunite: { include: { secteur: true, emetteur: true } } },
        orderBy: { dateCreation: 'desc' },
        skip: filters.skip,
        take: filters.take,
      }),
      this.prisma.candidature.count({ where }),
    ]);

    return { items, total };
  }

  create(utilisateurId: string, opportuniteId: string) {
    return this.prisma.candidature.create({
      data: { utilisateurId, opportuniteId },
    });
  }

  updateStatut(id: string, statut: StatutCandidature, dateSoumission?: Date) {
    return this.prisma.candidature.update({
      where: { id },
      data: {
        statut,
        ...(dateSoumission ? { dateSoumission } : {}),
      },
    });
  }

  delete(id: string) {
    return this.prisma.candidature.delete({ where: { id } });
  }
}
