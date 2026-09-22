import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ListFavorisFilters {
  utilisateurId: string;
  skip: number;
  take: number;
}

@Injectable()
export class FavoriRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUtilisateurEtOpportunite(utilisateurId: string, opportuniteId: string) {
    return this.prisma.favori.findUnique({
      where: { utilisateurId_opportuniteId: { utilisateurId, opportuniteId } },
    });
  }

  async findManyPaginated(filters: ListFavorisFilters) {
    const where = { utilisateurId: filters.utilisateurId };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.favori.findMany({
        where,
        include: { opportunite: { include: { secteur: true, emetteur: true } } },
        orderBy: { dateAjout: 'desc' },
        skip: filters.skip,
        take: filters.take,
      }),
      this.prisma.favori.count({ where }),
    ]);

    return { items, total };
  }

  create(utilisateurId: string, opportuniteId: string) {
    return this.prisma.favori.create({
      data: { utilisateurId, opportuniteId },
    });
  }

  delete(id: string) {
    return this.prisma.favori.delete({ where: { id } });
  }
}
