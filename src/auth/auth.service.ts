// src/auth/auth.service.ts
import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, RegisterRole } from './dto/register.dto';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { MailService } from '../common/mail/mail.service';
import { OtpService } from './otp.service';
import { ProfileValidator } from './profile-validator.util';
import { UtilisateurRepository } from './repositories/utilisateur.repository';
import { PendingRegistrationRepository } from './repositories/pending-registration.repository';
import { OtpPurpose, RoleUtilisateur } from '../generated/prisma/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly utilisateurRepository: UtilisateurRepository,
    private readonly pendingRegistrationRepository: PendingRegistrationRepository,
    private readonly jwt: JwtService,
    private readonly cloudinary: CloudinaryService,
    private readonly mail: MailService,
    private readonly otp: OtpService,
    private readonly profileValidator: ProfileValidator,
  ) {}

  private sanitize<T extends { motDePasse: string }>(user: T) {
    const { motDePasse: _motDePasse, ...rest } = user;
    return rest;
  }

  async register(dto: RegisterDto, logoFile?: { buffer: Buffer; filename: string }) {
    const existing = await this.utilisateurRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email déjà utilisé');

    let logoUrl: string | undefined;
    if (logoFile && (dto.role === RegisterRole.PME || dto.role === RegisterRole.ONG)) {
      logoUrl = await this.cloudinary.uploadLogo(logoFile.buffer, logoFile.filename);
    }

    const donneesProfil = await this.profileValidator.validateAndBuild(dto.role, dto, logoUrl);

    const motDePasseHash = await bcrypt.hash(dto.password, 10);

    await this.pendingRegistrationRepository.upsert({
      email: dto.email,
      motDePasse: motDePasseHash,
      role: dto.role as unknown as RoleUtilisateur,
      donneesProfil,
    });

    const code = await this.otp.createOtp(dto.email, OtpPurpose.EMAIL_VERIFICATION);
    await this.mail.sendOtpEmail(dto.email, code);

    return { message: 'Un code de vérification a été envoyé par email.', email: dto.email };
  }

  async verifyOtp(email: string, code: string) {
    const pending = await this.pendingRegistrationRepository.findByEmail(email);
    if (!pending) throw new BadRequestException("Aucune inscription en attente pour cet email");

    await this.otp.verifyOtp(email, OtpPurpose.EMAIL_VERIFICATION, code);

    const donnees = pending.donneesProfil as Record<string, unknown>;
    const utilisateur = await this.utilisateurRepository.createWithProfile(
      pending.email,
      pending.motDePasse,
      this.mapToProfileInput(pending.role, donnees),
    );

    await this.pendingRegistrationRepository.delete(email);

    const tokens = this.generateTokens(utilisateur.id, utilisateur.email, utilisateur.role);
    return { ...tokens, user: this.sanitize(utilisateur) };
  }

  private mapToProfileInput(role: RoleUtilisateur, d: Record<string, unknown>) {
    switch (role) {
      case 'ENTREPRENEUR':
        return {
          role: 'ENTREPRENEUR' as const,
          profile: {
            secteurActivite: d.secteurActivite as string,
            pays: d.pays as string,
            domaineExpertise: d.domaineExpertise as string,
            objectifs: d.objectifs as string | undefined,
          },
        };
      case 'PME':
        return {
          role: 'PME' as const,
          profile: {
            nomEntreprise: d.nomEntreprise as string,
            secteursActivite: d.secteursActivite as string[],
            logoUrl: d.logoUrl as string | undefined,
          },
        };
      case 'ONG':
        return {
          role: 'ONG' as const,
          profile: {
            nomOrganisation: d.nomOrganisation as string,
            domainesIntervention: d.domainesIntervention as string[],
            mission: d.mission as string | undefined,
            logoUrl: d.logoUrl as string | undefined,
          },
        };
      default:
        throw new BadRequestException("Rôle non supporté pour l'inscription publique");
    }
  }

  async resendOtp(email: string) {
    const pending = await this.pendingRegistrationRepository.findByEmail(email);
    if (!pending) {
      const existingUser = await this.utilisateurRepository.findByEmail(email);
      if (existingUser) throw new BadRequestException('Ce compte est déjà vérifié');
      throw new BadRequestException("Aucune inscription en attente pour cet email");
    }

    const code = await this.otp.createOtp(email, OtpPurpose.EMAIL_VERIFICATION);
    await this.mail.sendOtpEmail(email, code);

    return { message: 'Un nouveau code a été envoyé par email.' };
  }

  async login(email: string, password: string) {
    const user = await this.utilisateurRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const valid = await bcrypt.compare(password, user.motDePasse);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    const tokens = this.generateTokens(user.id, user.email, user.role);
    return { ...tokens, user: this.sanitize(user) };
  }

  async forgotPassword(email: string) {
    const user = await this.utilisateurRepository.findByEmail(email);

    if (user) {
      const code = await this.otp.createOtp(email, OtpPurpose.PASSWORD_RESET);
      await this.mail.sendPasswordResetEmail(email, code);
    }

    return {
      message: "Si un compte existe avec cet email, un code de réinitialisation a été envoyé.",
    };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.utilisateurRepository.findByEmail(email);
    if (!user) throw new BadRequestException('Utilisateur introuvable');

    await this.otp.verifyOtp(email, OtpPurpose.PASSWORD_RESET, code);

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.utilisateurRepository.updateMotDePasse(email, hashed);

    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  private generateTokens(sub: string, email: string, role: RoleUtilisateur) {
    return { accessToken: this.jwt.sign({ sub, email, role }) };
  }
}
