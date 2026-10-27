import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UtilisateurRepository } from '../auth/repositories/utilisateur.repository';

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
  private readonly logger = new Logger(OpportunitesIaService.name);
  private readonly iaEngineUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly utilisateurRepository: UtilisateurRepository,
  ) {
    this.iaEngineUrl = this.config.get<string>('IA_ENGINE_URL', 'http://localhost:3000');
  }

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

  // Pour l'admin : on renvoie juste l'opportunité, sans calcul de matching
  async getById(id: string) {
    return this.prisma.opportunityProcessed.findUnique({
      where: { id },
    });
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

  async getByIdWithMatch(id: string, userId: string) {
    const opp = await this.prisma.opportunityProcessed.findUnique({
      where: { id },
    });
    if (!opp) return null;

    const user = await this.utilisateurRepository.findByIdWithProfile(userId);
    if (!user) return opp;

    let matchScore = 0;
    let matchAdvice =
      "Complétez votre profil pour que l'IA puisse calculer votre score de correspondance.";
    let matchLabel: string | null = null;
    let matchDetails: Record<string, boolean> | null = null;

    try {
      const response = await fetch(`${this.iaEngineUrl}/api/match/single`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: user, opportunity: opp }),
      });

      if (response.ok) {
        const json = await response.json();
        const data = json.data;

        if (data) {
          matchScore = data.scorePourcentage || 0;
          matchAdvice = data.advice || matchAdvice;
          matchLabel = data.categoryLabel || null;
          matchDetails = data.details || null;
        }
      }
    } catch (error) {
      this.logger.error(`Erreur appel IA pour le match (Opp: ${id}, User: ${userId})`, error);
    }

    return {
      ...opp,
      matchScore,
      matchAdvice,
      matchLabel,
      matchDetails,
    };
  }
}
