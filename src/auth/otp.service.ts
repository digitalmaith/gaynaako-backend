// src/auth/otp.service.ts
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { OtpRepository } from './repositories/otp.repository';
import { OtpPurpose } from '../generated/prisma/enums';

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

@Injectable()
export class OtpService {
  constructor(private readonly otpRepository: OtpRepository) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000)
      .toString()
      .slice(0, OTP_LENGTH);
  }

  async createOtp(email: string, purpose: OtpPurpose): Promise<string> {
    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await this.otpRepository.invalidateActive(email, purpose);
    await this.otpRepository.create({ email, purpose, codeHash, expiresAt });

    return code;
  }

  async verifyOtp(email: string, purpose: OtpPurpose, code: string): Promise<void> {
    const otp = await this.otpRepository.findLatestActive(email, purpose);

    if (!otp) throw new BadRequestException('Aucun code de vérification actif');
    if (otp.expiresAt < new Date()) {
      throw new UnauthorizedException('Code expiré, demandez-en un nouveau');
    }
    if (otp.attempts >= MAX_ATTEMPTS) {
      throw new UnauthorizedException('Trop de tentatives, demandez un nouveau code');
    }

    const isValid = await bcrypt.compare(code, otp.codeHash);
    if (!isValid) {
      await this.otpRepository.incrementAttempts(otp.id);
      throw new UnauthorizedException('Code invalide');
    }

    await this.otpRepository.markConsumed(otp.id);
  }
}
