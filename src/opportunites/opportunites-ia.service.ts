// src/opportunites/opportunites-ia.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ListOpportunitiesIaQuery {
  page?: number;
  limit?: number;
  country?: string;
  sector?: string;
  search?: string;
  sourceType?: 'national' | 'international';
  minQuality?: number;
  opportunityType?: string;
}

@Injectable()
export class OpportunitesIaService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListOpportunitiesIaQuery) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.country) where.country = query.country;
    if (query.sourceType) where.sourceType = query.sourceType;
    if (query.opportunityType) where.opportunityType = query.opportunityType;
    if (query.minQuality) where.qualityScore = { gte: Number(query.minQuality) };

    if (query.sector) {
      where.sectors = { contains: query.sector };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.opportunityProcessed.findMany({
        where,
        orderBy: [{ qualityScore: 'desc' }, { collectedAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.opportunityProcessed.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    return this.prisma.opportunityProcessed.findUnique({ where: { id } });
  }

  async getCountries() {
    const result = await this.prisma.opportunityProcessed.groupBy({
      by: ['country'],
      _count: { _all: true },
      orderBy: { _count: { country: 'desc' } },
    });

    return result
      .filter((r) => r.country)
      .map((r) => ({
        country: r.country,
        count: r._count._all,
      }));
  }

  async getStats() {
    const [total, highQuality, countries, sources] = await Promise.all([
      this.prisma.opportunityProcessed.count(),
      this.prisma.opportunityProcessed.count({
        where: { qualityScore: { gte: 70 } },
      }),
      this.prisma.opportunityProcessed.findMany({
        distinct: ['country'],
        select: { country: true },
      }),
      this.prisma.opportunityProcessed.findMany({
        distinct: ['sourceName'],
        select: { sourceName: true },
      }),
    ]);

    return {
      total,
      highQuality,
      countries: countries.length,
      sources: sources.length,
    };
  }
}
