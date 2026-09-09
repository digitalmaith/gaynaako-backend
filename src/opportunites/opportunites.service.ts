import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OpportuniteRepository } from './repositories/opportunite.repository';
import { CreateOpportuniteDto } from './dto/create-opportunite.dto';
import { UpdateOpportuniteDto } from './dto/update-opportunite.dto';
import { ImportOpportuniteDto } from './dto/import-opportunite.dto';
import { ListOpportunitesQueryDto } from './dto/list-opportunites-query.dto';
import { OrigineOpportunite } from '../generated/prisma/enums';

@Injectable()
export class OpportunitesService {
  constructor(private readonly opportuniteRepository: OpportuniteRepository) {}

  async listOpportunites(query: ListOpportunitesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const { items, total } = await this.opportuniteRepository.findManyPaginated({
      type: query.type,
      origine: query.origine,
      secteurId: query.secteurId,
      search: query.search,
      inclureSupprimes: query.inclureSupprimes,
      skip,
      take: limit,
    });

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    const opp = await this.opportuniteRepository.findById(id);
    if (!opp) throw new NotFoundException('Opportunité introuvable');
    return opp;
  }

  createManuelle(dto: CreateOpportuniteDto, administrateurId?: string) {
    return this.opportuniteRepository.create({
      titre: dto.titre,
      description: dto.description,
      type: dto.type,
      pays: dto.pays,
      dateLimite: new Date(dto.dateLimite),
      criteresEligibilite: dto.criteresEligibilite,
      secteurId: dto.secteurId,
      emetteurId: dto.emetteurId,
      administrateurId,
      origine: OrigineOpportunite.MANUELLE,
    });
  }

  async update(id: string, dto: UpdateOpportuniteDto) {
    await this.getById(id);
    return this.opportuniteRepository.update(id, {
      ...dto,
      dateLimite: dto.dateLimite ? new Date(dto.dateLimite) : undefined,
    });
  }

  async delete(id: string) {
    await this.getById(id);
    await this.opportuniteRepository.softDelete(id);
    return { message: 'Opportunité supprimée avec succès' };
  }

  async restore(id: string) {
    const opp = await this.opportuniteRepository.findByIdIncludingDeleted(id);
    if (!opp) throw new NotFoundException('Opportunité introuvable');
    if (!opp.supprimeLe) throw new BadRequestException("Cette opportunité n'est pas supprimée");

    return this.opportuniteRepository.restore(id);
  }

  async importFromAi(dto: ImportOpportuniteDto) {
    const existing = await this.opportuniteRepository.findByExternalId(dto.externalId);

    const data = {
      titre: dto.titre,
      description: dto.description,
      type: dto.type,
      pays: dto.pays,
      dateLimite: new Date(dto.dateLimite),
      criteresEligibilite: dto.criteresEligibilite,
      secteurId: dto.secteurId,
      emetteurId: dto.emetteurId,
      origine: OrigineOpportunite.IA,
      externalId: dto.externalId,
    };

    if (existing) {
      const updated = await this.opportuniteRepository.update(existing.id, data);
      return { opportunite: updated, cree: false };
    }

    const created = await this.opportuniteRepository.create(data);
    return { opportunite: created, cree: true };
  }
}
