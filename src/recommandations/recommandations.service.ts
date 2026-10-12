import { Injectable } from '@nestjs/common';
import { RecommandationRepository } from './repositories/recommandation.repository';
import { RecommandationResponseDto } from './dto/recommandation-response.dto';

export interface ListRecommandationsOptions {
  page?: number;
  limit?: number;
  minScore?: number;
}

@Injectable()
export class RecommandationsService {
  constructor(private readonly recommandationRepository: RecommandationRepository) {}

  async listMyRecommandations(utilisateurId: string, options: ListRecommandationsOptions = {}) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.recommandationRepository.findManyByUtilisateur({
        utilisateurId,
        minScore: options.minScore,
        skip,
        take: limit,
      }),
      this.recommandationRepository.countByUtilisateur(utilisateurId, options.minScore),
    ]);

    const items: RecommandationResponseDto[] = rows.map((r) => {
      const op = r.opportunityProcessed;

      // ⬇️ Force le typage de `sectors` en string pour rassurer ESLint
      const secteursRaw: string = op?.sectors ?? '';
      const secteurs: string[] = secteursRaw
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      return {
        id: r.id,
        scorePertinence: r.scorePertinence,
        scorePourcentage: Math.round(r.scorePertinence * 100),
        methodeMatching: r.methodeMatching,
        dateGeneration: r.dateGeneration,
        opportunite: {
          id: op?.id ?? '',
          titre: op?.title ?? 'Opportunité introuvable',
          description: op?.description ?? null,
          type: op?.opportunityType ?? null,
          pays: op?.country ?? null,
          secteurs,
          organisation: op?.organization ?? null,
          url: op?.url ?? null,
          deadline: op?.deadline ?? null,
          qualityScore: op?.qualityScore ?? null,
        },
      };
    });

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
}
