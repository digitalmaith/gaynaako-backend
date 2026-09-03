// src/users/users.service.ts
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

  private sanitize<T extends { motDePasse: string }>(user: T) {
    const rest: Record<string, unknown> = { ...user };
    delete rest.motDePasse;
    return rest as Omit<T, 'motDePasse'>;
  }

  async getMyProfile(utilisateurId: string) {
    const user = await this.utilisateurRepository.findByIdWithProfile(utilisateurId);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.sanitize(user);
  }

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

  async updateLogo(
    utilisateurId: string,
    role: string,
    logoFile: { buffer: Buffer; filename: string },
  ) {
    if (role !== RoleUtilisateur.PME && role !== RoleUtilisateur.ONG) {
      throw new BadRequestException(`Seuls les comptes PME et ONG ont un logo`);
    }

    const logoUrl = await this.cloudinary.uploadLogo(logoFile.buffer, logoFile.filename);

    if (role === RoleUtilisateur.PME) {
      await this.utilisateurRepository.updatePmeProfile(utilisateurId, { logoUrl });
    } else {
      await this.utilisateurRepository.updateOngProfile(utilisateurId, { logoUrl });
    }

    return this.getMyProfile(utilisateurId);
  }

  async changePassword(utilisateurId: string, currentPassword: string, newPassword: string) {
    const user = await this.utilisateurRepository.findById(utilisateurId);
    if (!user) throw new NotFoundException(`Utilisateur introuvable`);

    const valid = await bcrypt.compare(currentPassword, user.motDePasse);
    if (!valid) throw new UnauthorizedException(`Mot de passe actuel incorrect`);

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.utilisateurRepository.updateMotDePasse(user.email, hashed);

    return { message: 'Mot de passe modifié avec succès' };
  }

  private assertRole(actual: string, expected: RoleUtilisateur): void {
    if (actual !== expected) {
      throw new BadRequestException(`Cette action est réservée aux comptes ${expected}`);
    }
  }

  async updateIdentity(utilisateurId: string, dto: UpdateIdentityDto) {
    await this.utilisateurRepository.updateIdentity(utilisateurId, dto);
    return this.getMyProfile(utilisateurId);
  }
}
