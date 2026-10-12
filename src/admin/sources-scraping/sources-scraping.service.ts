import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SourceScrapingRepository } from './repositories/source-scraping.repository';
import { UtilisateurRepository } from '../../auth/repositories/utilisateur.repository';
import { JournalRepository } from '../repositories/journal.repository';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { ListSourcesQueryDto } from './dto/list-sources-query.dto';
import { TypeSourceScraping } from '../../generated/prisma/enums';

@Injectable()
export class SourcesScrapingService {
  constructor(
    private readonly sourceRepository: SourceScrapingRepository,
    private readonly utilisateurRepository: UtilisateurRepository,
    private readonly journalRepository: JournalRepository,
  ) {}

  async listSources(query: ListSourcesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const { items, total } = await this.sourceRepository.findManyPaginated({
      type: query.type,
      actif: query.actif,
      search: query.search,
      skip,
      take: limit,
    });

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSourceById(id: string) {
    const source = await this.sourceRepository.findById(id);
    if (!source) throw new NotFoundException('Source introuvable');
    return source;
  }

  async createSource(dto: CreateSourceDto, adminUtilisateurId: string) {
    this.validateSelectorsByType(dto.type, dto.selectors);

    const sameName = await this.sourceRepository.countByNom(dto.nom);
    if (sameName > 0) {
      throw new ConflictException(`Une source avec le nom "${dto.nom}" existe déjà`);
    }

    const sameUrl = await this.sourceRepository.countByUrl(dto.url);
    if (sameUrl > 0) {
      throw new ConflictException(`Une source avec cette URL existe déjà`);
    }

    const adminProfile = await this.getAdminProfileOrThrow(adminUtilisateurId);

    const source = await this.sourceRepository.create({
      nom: dto.nom,
      url: dto.url,
      type: dto.type,
      actif: dto.actif ?? true,
      selectors: dto.selectors,
      pagination: dto.pagination,
      rateLimitMs: dto.rateLimitMs ?? 3000,
      apiConfig: dto.apiConfig,
    });

    await this.journalRepository.log(adminProfile.id, `Source de scraping "${source.nom}" créée`);

    return source;
  }

  async updateSource(id: string, dto: UpdateSourceDto, adminUtilisateurId: string) {
    const existing = await this.sourceRepository.findById(id);
    if (!existing) throw new NotFoundException('Source introuvable');

    const futureType = dto.type ?? existing.type;
    const futureSelectors = dto.selectors ?? (existing.selectors as Record<string, string> | null);
    this.validateSelectorsByType(futureType, futureSelectors ?? undefined);

    if (dto.nom && dto.nom !== existing.nom) {
      const sameName = await this.sourceRepository.countByNom(dto.nom);
      if (sameName > 0) {
        throw new ConflictException(`Une source avec le nom "${dto.nom}" existe déjà`);
      }
    }

    if (dto.url && dto.url !== existing.url) {
      const sameUrl = await this.sourceRepository.countByUrl(dto.url);
      if (sameUrl > 0) {
        throw new ConflictException(`Une source avec cette URL existe déjà`);
      }
    }

    const adminProfile = await this.getAdminProfileOrThrow(adminUtilisateurId);

    const updated = await this.sourceRepository.update(id, {
      ...(dto.nom !== undefined ? { nom: dto.nom } : {}),
      ...(dto.url !== undefined ? { url: dto.url } : {}),
      ...(dto.type !== undefined ? { type: dto.type } : {}),
      ...(dto.actif !== undefined ? { actif: dto.actif } : {}),
      ...(dto.selectors !== undefined ? { selectors: dto.selectors } : {}),
      ...(dto.pagination !== undefined ? { pagination: dto.pagination } : {}),
      ...(dto.rateLimitMs !== undefined ? { rateLimitMs: dto.rateLimitMs } : {}),
      ...(dto.apiConfig !== undefined ? { apiConfig: dto.apiConfig } : {}),
    });

    await this.journalRepository.log(
      adminProfile.id,
      `Source de scraping "${existing.nom}" modifiée`,
    );

    return updated;
  }

  async updateActif(id: string, actif: boolean, adminUtilisateurId: string) {
    const existing = await this.sourceRepository.findById(id);
    if (!existing) throw new NotFoundException('Source introuvable');

    const adminProfile = await this.getAdminProfileOrThrow(adminUtilisateurId);

    const updated = await this.sourceRepository.updateActif(id, actif);

    await this.journalRepository.log(
      adminProfile.id,
      `Source de scraping "${existing.nom}" ${actif ? 'activée' : 'désactivée'}`,
    );

    return updated;
  }

  async deleteSource(id: string, adminUtilisateurId: string) {
    const existing = await this.sourceRepository.findById(id);
    if (!existing) throw new NotFoundException('Source introuvable');

    const adminProfile = await this.getAdminProfileOrThrow(adminUtilisateurId);

    await this.sourceRepository.delete(id);

    await this.journalRepository.log(
      adminProfile.id,
      `Source de scraping "${existing.nom}" supprimée`,
    );

    return { message: 'Source supprimée avec succès' };
  }

  private validateSelectorsByType(type: TypeSourceScraping, selectors?: Record<string, string>) {
    if ((type === TypeSourceScraping.html || type === TypeSourceScraping.puppeteer) && !selectors) {
      throw new BadRequestException(
        `Les "selectors" sont obligatoires pour une source de type "${type}"`,
      );
    }
  }

  private async getAdminProfileOrThrow(adminUtilisateurId: string) {
    const adminProfile =
      await this.utilisateurRepository.findAdministrateurProfileByUtilisateurId(adminUtilisateurId);
    if (!adminProfile) {
      throw new BadRequestException("Profil administrateur introuvable pour l'auteur de l'action");
    }
    return adminProfile;
  }
}
