import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { MailService } from '../common/mail/mail.service';
import { OtpService } from './otp.service';
import { UserRepository } from './repositories/user.repository';
import { PendingRegistrationRepository } from './repositories/pending-registration.repository';
import { Role, OtpPurpose } from '../generated/prisma/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly pendingRegistrationRepository: PendingRegistrationRepository,
    private readonly jwt: JwtService,
    private readonly cloudinary: CloudinaryService,
    private readonly mail: MailService,
    private readonly otp: OtpService,
  ) {}

  private sanitizeUser<T extends { password: string }>(
    user: T,
  ): Omit<T, 'password'> {
    const { password, ...sanitizedUser } = user;

    void password;

    return sanitizedUser;
  }

  async register(
    dto: RegisterDto,
    logoFile?: { buffer: Buffer; filename: string },
  ) {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) throw new ConflictException('Email déjà utilisé');

    if (
      (dto.role === Role.PME || dto.role === Role.ONG) &&
      !dto.organizationName
    ) {
      throw new ConflictException("Le nom de l'organisation est requis");
    }

    let logoUrl: string | undefined;
    if (logoFile) {
      logoUrl = await this.cloudinary.uploadLogo(
        logoFile.buffer,
        logoFile.filename,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    await this.pendingRegistrationRepository.upsert({
      email: dto.email,
      passwordHash,
      role: dto.role,
      firstName: dto.firstName,
      lastName: dto.lastName,
      organizationName: dto.organizationName,
      logoUrl,
    });

    const code = await this.otp.createOtp(
      dto.email,
      OtpPurpose.EMAIL_VERIFICATION,
    );
    await this.mail.sendOtpEmail(dto.email, code, dto.firstName);

    return {
      message: 'Un code de vérification a été envoyé par email.',
      email: dto.email,
    };
  }

  async verifyOtp(email: string, code: string) {
    const pending = await this.pendingRegistrationRepository.findByEmail(email);
    if (!pending) {
      throw new BadRequestException(
        'Aucune inscription en attente pour cet email',
      );
    }

    await this.otp.verifyOtp(email, OtpPurpose.EMAIL_VERIFICATION, code);

    const user = await this.userRepository.create({
      email: pending.email,
      password: pending.passwordHash,
      role: pending.role,
      firstName: pending.firstName,
      lastName: pending.lastName,
      organizationName: pending.organizationName,
      logoUrl: pending.logoUrl,
      isEmailVerified: true,
    });

    await this.pendingRegistrationRepository.delete(email);

    const tokens = this.generateTokens(user.id, user.email, user.role);
    return { ...tokens, user: this.sanitizeUser(user) };
  }

  async resendOtp(email: string) {
    const pending = await this.pendingRegistrationRepository.findByEmail(email);
    if (!pending) {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new BadRequestException('Ce compte est déjà vérifié');
      }
      throw new BadRequestException(
        'Aucune inscription en attente pour cet email',
      );
    }

    const code = await this.otp.createOtp(email, OtpPurpose.EMAIL_VERIFICATION);
    await this.mail.sendOtpEmail(email, code, pending.firstName ?? undefined);

    return { message: 'Un nouveau code a été envoyé par email.' };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    const tokens = this.generateTokens(user.id, user.email, user.role);
    return { ...tokens, user: this.sanitizeUser(user) };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);

    // Toujours renvoyer le même message, qu'un compte existe ou non,
    // pour éviter de révéler quels emails sont enregistrés (énumération)
    if (!user) {
      return {
        message:
          'Si un compte existe avec cet email, un code de réinitialisation a été envoyé.',
      };
    }

    const code = await this.otp.createOtp(email, OtpPurpose.PASSWORD_RESET);
    await this.mail.sendPasswordResetEmail(
      email,
      code,
      user.firstName ?? undefined,
    );

    return {
      message:
        'Si un compte existe avec cet email, un code de réinitialisation a été envoyé.',
    };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    await this.otp.verifyOtp(email, OtpPurpose.PASSWORD_RESET, code);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updatePassword(email, hashedPassword);

    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  private generateTokens(sub: string, email: string, role: Role) {
    const payload = { sub, email, role };
    return {
      accessToken: this.jwt.sign(payload),
    };
  }
}
