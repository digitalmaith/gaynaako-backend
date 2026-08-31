import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UtilisateurRepository } from '../auth/repositories/utilisateur.repository';
import { JournalRepository } from './repositories/journal.repository';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { RoleUtilisateur } from '../generated/prisma/enums';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly utilisateurRepository: UtilisateurRepository,
    private readonly journalRepository: JournalRepository,
  ) {}

  private sanitize<T extends { motDePasse: string }>(user: T) {
    const rest: Record<string, unknown> = { ...user };
    delete rest.motDePasse;
    return rest as Omit<T, 'motDePasse'>;
  }

  async listUsers(query: ListUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const { items, total } = await this.utilisateurRepository.findManyPaginated({
      role: query.role,
      statut: query.statut,
      search: query.search,
      skip,
      take: limit,
    });

    return {
      items: items.map((u) => this.sanitize(u)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.utilisateurRepository.findByIdWithProfile(id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.sanitize(user);
  }

  async updateStatut(id: string, statut: string, adminUtilisateurId: string) {
    const target = await this.utilisateurRepository.findById(id);
    if (!target) throw new NotFoundException('Utilisateur introuvable');

    const updated = await this.utilisateurRepository.updateStatut(id, statut as never);

    await this.logAction(
      adminUtilisateurId,
      `Statut de l'utilisateur ${target.email} changé en ${statut}`,
    );

    return this.sanitize(updated);
  }

  async deleteUser(id: string, adminUtilisateurId: string) {
    if (id === adminUtilisateurId) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer votre propre compte');
    }

    const target = await this.utilisateurRepository.findById(id);
    if (!target) throw new NotFoundException('Utilisateur introuvable');

    if (target.role === RoleUtilisateur.ADMINISTRATEUR) {
      throw new ForbiddenException(
        "La suppression d'un compte administrateur n'est pas autorisée via cet endpoint",
      );
    }

    await this.utilisateurRepository.deleteById(id);
    await this.logAction(adminUtilisateurId, `Utilisateur ${target.email} supprimé`);

    return { message: 'Utilisateur supprimé avec succès' };
  }

  private async logAction(adminUtilisateurId: string, action: string): Promise<void> {
    const adminProfile =
      await this.utilisateurRepository.findAdministrateurProfileByUtilisateurId(adminUtilisateurId);
    if (!adminProfile) {
      throw new BadRequestException("Profil administrateur introuvable pour l'auteur de l'action");
    }
    await this.journalRepository.log(adminProfile.id, action);
  }
}
