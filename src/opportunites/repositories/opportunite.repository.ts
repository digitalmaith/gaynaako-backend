import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrigineOpportunite, TypeOpportunite } from '../../generated/prisma/enums';

export interface ListOpportunitesFilters {
  type?: TypeOpportunite;
  origine?: OrigineOpportunite;
  secteurId?: string;
  search?: string;
  inclureSupprimes?: boolean;
  skip: number;
  take: number;
}

export interface UpsertOpportuniteData {
  titre: string;
  description: string;
  type: TypeOpportunite;
  pays: string;
  dateLimite: Date;
  criteresEligibilite?: string;
  secteurId: string;
  emetteurId?: string;
  administrateurId?: string;
  origine: OrigineOpportunite;
  externalId?: string;
}

@Injectable()
export class OpportuniteRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.opportunite.findFirst({
      where: { id, supprimeLe: null },
      include: { secteur: true, emetteur: true },
    });
  }

  findByIdIncludingDeleted(id: string) {
    return this.prisma.opportunite.findUnique({
      where: { id },
      include: { secteur: true, emetteur: true },
    });
  }

  findByExternalId(externalId: string) {
    return this.prisma.opportunite.findUnique({ where: { externalId } });
  }

  private buildWhere(
    filters: Pick<
      ListOpportunitesFilters,
      'type' | 'origine' | 'secteurId' | 'search' | 'inclureSupprimes'
    >,
  ) {
    return {
      ...(filters.inclureSupprimes ? {} : { supprimeLe: null }),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.origine ? { origine: filters.origine } : {}),
      ...(filters.secteurId ? { secteurId: filters.secteurId } : {}),
      ...(filters.search
        ? { titre: { contains: filters.search, mode: 'insensitive' as const } }
        : {}),
    };
  }

  async findManyPaginated(filters: ListOpportunitesFilters) {
    const where = this.buildWhere(filters);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.opportunite.findMany({
        where,
        include: { secteur: true, emetteur: true },
        orderBy: { dateCreation: 'desc' },
        skip: filters.skip,
        take: filters.take,
      }),
      this.prisma.opportunite.count({ where }),
    ]);

    return { items, total };
  }

  create(data: UpsertOpportuniteData) {
    return this.prisma.opportunite.create({ data });
  }

  update(id: string, data: Partial<UpsertOpportuniteData>) {
    return this.prisma.opportunite.update({ where: { id }, data });
  }

  softDelete(id: string) {
    return this.prisma.opportunite.update({
      where: { id },
      data: { supprimeLe: new Date() },
    });
  }

  restore(id: string) {
    return this.prisma.opportunite.update({
      where: { id },
      data: { supprimeLe: null },
    });
  }

  countByEmetteur(emetteurId: string) {
    return this.prisma.opportunite.count({ where: { emetteurId, supprimeLe: null } });
  }
}
