import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { FavoriRepository } from './repositories/favori.repository';
import { ListFavorisQueryDto } from './dto/list-favoris-query.dto';

@Injectable()
export class FavorisService {
  constructor(private readonly favoriRepository: FavoriRepository) {}

  async listMyFavoris(utilisateurId: string, query: ListFavorisQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const { items, total } = await this.favoriRepository.findManyPaginated({
      utilisateurId,
      skip,
      take: limit,
    });

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async add(utilisateurId: string, opportuniteId: string) {
    const existing = await this.favoriRepository.findByUtilisateurEtOpportunite(
      utilisateurId,
      opportuniteId,
    );
    if (existing) {
      throw new ConflictException('Cette opportunité est déjà dans vos favoris');
    }

    return this.favoriRepository.create(utilisateurId, opportuniteId);
  }

  async remove(utilisateurId: string, opportuniteId: string) {
    const existing = await this.favoriRepository.findByUtilisateurEtOpportunite(
      utilisateurId,
      opportuniteId,
    );
    if (!existing) {
      throw new NotFoundException("Cette opportunité n'est pas dans vos favoris");
    }

    await this.favoriRepository.delete(existing.id);
    return { message: 'Retiré des favoris avec succès' };
  }
}
