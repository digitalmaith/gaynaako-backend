import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StatutEmetteur, TypeEmetteur } from '../../generated/prisma/enums';

export interface ListEmetteursFilters {
  type?: TypeEmetteur;
  statut?: StatutEmetteur;
  search?: string;
  skip: number;
  take: number;
}

export interface CreateEmetteurData {
  nom: string;
  url: string;
  type: TypeEmetteur;
  frequenceCollecte: string;
  administrateurId: string;
}

@Injectable()
export class EmetteurRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.emetteur.findUnique({ where: { id } });
  }

  private buildWhere(filters: Pick<ListEmetteursFilters, 'type' | 'statut' | 'search'>) {
    return {
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.statut ? { statut: filters.statut } : {}),
      ...(filters.search
        ? { nom: { contains: filters.search, mode: 'insensitive' as const } }
        : {}),
    };
  }

  async findManyPaginated(filters: ListEmetteursFilters) {
    const where = this.buildWhere(filters);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.emetteur.findMany({
        where,
        orderBy: { nom: 'asc' },
        skip: filters.skip,
        take: filters.take,
      }),
      this.prisma.emetteur.count({ where }),
    ]);

    return { items, total };
  }

  create(data: CreateEmetteurData) {
    return this.prisma.emetteur.create({ data });
  }

  update(id: string, data: Partial<Omit<CreateEmetteurData, 'administrateurId'>>) {
    return this.prisma.emetteur.update({ where: { id }, data });
  }

  updateStatut(id: string, statut: StatutEmetteur) {
    return this.prisma.emetteur.update({ where: { id }, data: { statut } });
  }

  delete(id: string) {
    return this.prisma.emetteur.delete({ where: { id } });
  }

  countOpportunitesByEmetteur(id: string) {
    return this.prisma.opportunite.count({ where: { emetteurId: id } });
  }
}
