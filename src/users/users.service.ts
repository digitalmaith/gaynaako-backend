import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UtilisateurRepository } from '../auth/repositories/utilisateur.repository';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { UpdateEntrepreneurProfileDto } from './dto/update-entrepreneur-profile.dto';
import { UpdatePmeProfileDto } from './dto/update-pme-profile.dto';
import { UpdateOngProfileDto } from './dto/update-ong-profile.dto';
import { RoleUtilisateur } from '../generated/prisma/enums';
import { UpdateIdentityDto } from './dto/update-identity.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly utilisateurRepository: UtilisateurRepository,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async getMyProfile(utilisateurId: string) {
    const user = await this.utilisateurRepository.findByIdWithFullProfile(utilisateurId);
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const { motDePasse, abonnements, documents, statistiques, ...rest } = user;
    void motDePasse;

    // Normaliser l'abonnement (1 seul)
    const abonnement = abonnements[0]
      ? {
          id: abonnements[0].id,
          statut: abonnements[0].statut,
          cycle: abonnements[0].cycle,
          dateDebut: abonnements[0].dateDebut,
          dateFin: abonnements[0].dateFin,
          renouvellementAuto: abonnements[0].renouvellementAuto,
          plan: {
            id: abonnements[0].plan.id,
            nom: abonnements[0].plan.nom,
            description: abonnements[0].plan.description,
            prixMensuel: abonnements[0].plan.prixMensuel,
            prixAnnuel: abonnements[0].plan.prixAnnuel,
          },
        }
      : null;

    // Documents masqués pour les admins
    const documentsMapped =
      rest.role === RoleUtilisateur.ADMINISTRATEUR
        ? []
        : documents.map((d) => ({
            id: d.id,
            type: d.type,
            libelle: d.libelle,
            nomFichier: d.nomFichier,
            mimeType: d.mimeType,
            tailleOctets: d.tailleOctets,
            dateExpiration: d.dateExpiration,
            dateAjout: d.dateAjout,
            url: this.cloudinary.getSignedDocumentUrl(
              d.publicId,
              d.resourceType,
              d.nomFichier.split('.').pop() ?? 'pdf',
            ),
          }));

    return {
      ...rest,
      documents: documentsMapped,
      abonnement,
      statistiques,
    };
  }

  // ─── Profils spécifiques ──────────────────────────────────

  async updateEntrepreneurProfile(
    utilisateurId: string,
    role: string,
    dto: UpdateEntrepreneurProfileDto,
  ) {
    this.assertRole(role, RoleUtilisateur.ENTREPRENEUR);
    await this.utilisateurRepository.updateEntrepreneurProfile(utilisateurId, dto);
    return this.getMyProfile(utilisateurId);
  }

  async updatePmeProfile(utilisateurId: string, role: string, dto: UpdatePmeProfileDto) {
    this.assertRole(role, RoleUtilisateur.PME);
    await this.utilisateurRepository.updatePmeProfile(utilisateurId, dto);
    return this.getMyProfile(utilisateurId);
  }

  async updateOngProfile(utilisateurId: string, role: string, dto: UpdateOngProfileDto) {
    this.assertRole(role, RoleUtilisateur.ONG);
    await this.utilisateurRepository.updateOngProfile(utilisateurId, dto);
    return this.getMyProfile(utilisateurId);
  }

  // ─── Logo (ENTREPRENEUR / PME / ONG) ──────────────────────

  async updateLogo(
    utilisateurId: string,
    role: string,
    logoFile: { buffer: Buffer; filename: string },
  ) {
    const allowedRoles: string[] = [
      RoleUtilisateur.ENTREPRENEUR,
      RoleUtilisateur.PME,
      RoleUtilisateur.ONG,
    ];

    if (!allowedRoles.includes(role)) {
      throw new BadRequestException(`Les comptes ${role} n'ont pas de logo`);
    }

    const logoUrl = await this.cloudinary.uploadLogo(logoFile.buffer, logoFile.filename);

    if (role === RoleUtilisateur.ENTREPRENEUR) {
      await this.utilisateurRepository.updateEntrepreneurLogo(utilisateurId, logoUrl);
    } else if (role === RoleUtilisateur.PME) {
      await this.utilisateurRepository.updatePmeProfile(utilisateurId, { logoUrl });
    } else if (role === RoleUtilisateur.ONG) {
      await this.utilisateurRepository.updateOngProfile(utilisateurId, { logoUrl });
    }

    return this.getMyProfile(utilisateurId);
  }

  // ─── Avatar (tous les rôles) ──────────────────────────────

  async updateAvatar(utilisateurId: string, avatarFile: { buffer: Buffer; filename: string }) {
    const avatarUrl = await this.cloudinary.uploadLogo(avatarFile.buffer, avatarFile.filename);
    await this.utilisateurRepository.updateAvatar(utilisateurId, avatarUrl);
    return this.getMyProfile(utilisateurId);
  }

  // ─── Mot de passe ─────────────────────────────────────────

  async changePassword(utilisateurId: string, currentPassword: string, newPassword: string) {
    const user = await this.utilisateurRepository.findById(utilisateurId);
    if (!user) throw new NotFoundException(`Utilisateur introuvable`);

    const valid = await bcrypt.compare(currentPassword, user.motDePasse);
    if (!valid) throw new UnauthorizedException(`Mot de passe actuel incorrect`);

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.utilisateurRepository.updateMotDePasse(user.email, hashed);

    return { message: 'Mot de passe modifié avec succès' };
  }

  // ─── Identité ─────────────────────────────────────────────

  async updateIdentity(utilisateurId: string, dto: UpdateIdentityDto) {
    await this.utilisateurRepository.updateIdentity(utilisateurId, dto);
    return this.getMyProfile(utilisateurId);
  }

  // ─── Helper ───────────────────────────────────────────────

  private assertRole(actual: string, expected: RoleUtilisateur): void {
    if (actual !== expected) {
      throw new BadRequestException(`Cette action est réservée aux comptes ${expected}`);
    }
  }
}
