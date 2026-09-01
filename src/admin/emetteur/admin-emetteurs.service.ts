import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmetteurRepository } from '../repositories/emetteur.repository';
import { UtilisateurRepository } from '../../auth/repositories/utilisateur.repository';
import { JournalRepository } from '../repositories/journal.repository';
import { CreateEmetteurDto } from '../dto/emetteur/create-emetteur.dto';
import { UpdateEmetteurDto } from '../dto/emetteur/update-emetteur.dto';
import { ListEmetteursQueryDto } from '../dto/emetteur/list-emetteurs-query.dto';
import { StatutEmetteur } from '../../generated/prisma/enums';

@Injectable()
export class AdminEmetteursService {
  constructor(
    private readonly emetteurRepository: EmetteurRepository,
    private readonly utilisateurRepository: UtilisateurRepository,
    private readonly journalRepository: JournalRepository,
  ) {}

  async listEmetteurs(query: ListEmetteursQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const { items, total } = await this.emetteurRepository.findManyPaginated({
      type: query.type,
      statut: query.statut,
      search: query.search,
      skip,
      take: limit,
    });

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getEmetteurById(id: string) {
    const emetteur = await this.emetteurRepository.findById(id);
    if (!emetteur) throw new NotFoundException('Émetteur introuvable');
    return emetteur;
  }

  async createEmetteur(dto: CreateEmetteurDto, adminUtilisateurId: string) {
    const adminProfile = await this.getAdminProfileOrThrow(adminUtilisateurId);

    const emetteur = await this.emetteurRepository.create({
      nom: dto.nom,
      url: dto.url,
      type: dto.type,
      frequenceCollecte: dto.frequenceCollecte,
      administrateurId: adminProfile.id,
    });

    await this.journalRepository.log(adminProfile.id, `Émetteur "${emetteur.nom}" créé`);

    return emetteur;
  }

  async updateEmetteur(id: string, dto: UpdateEmetteurDto, adminUtilisateurId: string) {
    const existing = await this.emetteurRepository.findById(id);
    if (!existing) throw new NotFoundException('Émetteur introuvable');

    const adminProfile = await this.getAdminProfileOrThrow(adminUtilisateurId);

    const updated = await this.emetteurRepository.update(id, dto);

    await this.journalRepository.log(adminProfile.id, `Émetteur "${existing.nom}" modifié`);

    return updated;
  }

  async updateStatut(id: string, statut: StatutEmetteur, adminUtilisateurId: string) {
    const existing = await this.emetteurRepository.findById(id);
    if (!existing) throw new NotFoundException('Émetteur introuvable');

    const adminProfile = await this.getAdminProfileOrThrow(adminUtilisateurId);

    const updated = await this.emetteurRepository.updateStatut(id, statut);

    await this.journalRepository.log(
      adminProfile.id,
      `Statut de l'émetteur "${existing.nom}" changé en ${statut}`,
    );

    return updated;
  }

  async deleteEmetteur(id: string, adminUtilisateurId: string) {
    const existing = await this.emetteurRepository.findById(id);
    if (!existing) throw new NotFoundException('Émetteur introuvable');

    const nbOpportunites = await this.emetteurRepository.countOpportunitesByEmetteur(id);
    if (nbOpportunites > 0) {
      throw new ConflictException(
        `Impossible de supprimer : ${nbOpportunites} opportunité(s) rattachée(s) à cet émetteur. Désactivez-le plutôt (statut INACTIF).`,
      );
    }

    const adminProfile = await this.getAdminProfileOrThrow(adminUtilisateurId);

    await this.emetteurRepository.delete(id);

    await this.journalRepository.log(adminProfile.id, `Émetteur "${existing.nom}" supprimé`);

    return { message: 'Émetteur supprimé avec succès' };
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
