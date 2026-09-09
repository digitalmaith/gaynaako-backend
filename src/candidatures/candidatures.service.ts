import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CandidatureRepository } from './repositories/candidature.repository';
import { ListCandidaturesQueryDto } from './dto/list-candidatures-query.dto';
import { StatutCandidature } from '../generated/prisma/enums';

@Injectable()
export class CandidaturesService {
  constructor(private readonly candidatureRepository: CandidatureRepository) {}

  async listMyCandidatures(utilisateurId: string, query: ListCandidaturesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const { items, total } = await this.candidatureRepository.findManyPaginated({
      utilisateurId,
      statut: query.statut,
      skip,
      take: limit,
    });

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string, utilisateurId: string) {
    const candidature = await this.candidatureRepository.findById(id);
    if (!candidature) throw new NotFoundException('Candidature introuvable');
    if (candidature.utilisateurId !== utilisateurId) {
      throw new ForbiddenException('Cette candidature ne vous appartient pas');
    }
    return candidature;
  }

  async create(utilisateurId: string, opportuniteId: string) {
    const existing = await this.candidatureRepository.findByUtilisateurEtOpportunite(
      utilisateurId,
      opportuniteId,
    );
    if (existing) {
      throw new ConflictException('Vous avez déjà une candidature pour cette opportunité');
    }

    return this.candidatureRepository.create(utilisateurId, opportuniteId);
  }

  async updateStatut(id: string, utilisateurId: string, statut: StatutCandidature) {
    const candidature = await this.getById(id, utilisateurId);

    const dateSoumission =
      statut === StatutCandidature.SOUMISE && candidature.statut === StatutCandidature.BROUILLON
        ? new Date()
        : undefined;

    return this.candidatureRepository.updateStatut(id, statut, dateSoumission);
  }

  async delete(id: string, utilisateurId: string) {
    await this.getById(id, utilisateurId);
    await this.candidatureRepository.delete(id);
    return { message: 'Candidature supprimée avec succès' };
  }
}
