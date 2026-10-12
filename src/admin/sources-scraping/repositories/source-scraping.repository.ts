import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { TypeSourceScraping } from '../../../generated/prisma/enums';

export interface ListSourcesFilters {
  type?: TypeSourceScraping;
  actif?: boolean;
  search?: string;
  skip: number;
  take: number;
}

export interface CreateSourceData {
  nom: string;
  url: string;
  type: TypeSourceScraping;
  actif: boolean;
  selectors?: Record<string, unknown>;
  pagination?: Record<string, unknown>;
  rateLimitMs: number;
  apiConfig?: Record<string, unknown>;
}

@Injectable()
export class SourceScrapingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.sourceScraping.findUnique({ where: { id } });
  }

  private buildWhere(
    filters: Pick<ListSourcesFilters, 'type' | 'actif' | 'search'>,
  ): Prisma.SourceScrapingWhereInput {
    return {
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.actif !== undefined ? { actif: filters.actif } : {}),
      ...(filters.search
        ? {
            OR: [{ nom: { contains: filters.search } }, { url: { contains: filters.search } }],
          }
        : {}),
    };
  }

  async findManyPaginated(filters: ListSourcesFilters) {
    const where = this.buildWhere(filters);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.sourceScraping.findMany({
        where,
        orderBy: { nom: 'asc' },
        skip: filters.skip,
        take: filters.take,
      }),
      this.prisma.sourceScraping.count({ where }),
    ]);

    return { items, total };
  }

  create(data: CreateSourceData) {
    return this.prisma.sourceScraping.create({
      data: {
        nom: data.nom,
        url: data.url,
        type: data.type,
        actif: data.actif,
        rateLimitMs: data.rateLimitMs,
        selectors: data.selectors as Prisma.InputJsonValue | undefined,
        pagination: data.pagination as Prisma.InputJsonValue | undefined,
        apiConfig: data.apiConfig as Prisma.InputJsonValue | undefined,
      },
    });
  }

  update(id: string, data: Partial<Omit<CreateSourceData, 'actif'>> & { actif?: boolean }) {
    return this.prisma.sourceScraping.update({
      where: { id },
      data: {
        ...(data.nom !== undefined ? { nom: data.nom } : {}),
        ...(data.url !== undefined ? { url: data.url } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.actif !== undefined ? { actif: data.actif } : {}),
        ...(data.rateLimitMs !== undefined ? { rateLimitMs: data.rateLimitMs } : {}),
        ...(data.selectors !== undefined
          ? { selectors: data.selectors as Prisma.InputJsonValue }
          : {}),
        ...(data.pagination !== undefined
          ? { pagination: data.pagination as Prisma.InputJsonValue }
          : {}),
        ...(data.apiConfig !== undefined
          ? { apiConfig: data.apiConfig as Prisma.InputJsonValue }
          : {}),
      },
    });
  }

  updateActif(id: string, actif: boolean) {
    return this.prisma.sourceScraping.update({ where: { id }, data: { actif } });
  }

  delete(id: string) {
    return this.prisma.sourceScraping.delete({ where: { id } });
  }

  countByNom(nom: string) {
    return this.prisma.sourceScraping.count({ where: { nom } });
  }

  countByUrl(url: string) {
    return this.prisma.sourceScraping.count({ where: { url } });
  }
}
