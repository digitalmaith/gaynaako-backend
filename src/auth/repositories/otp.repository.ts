import { Injectable } from '@nestjs/common';
import { OtpPurpose } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OtpRepository {
  constructor(private readonly prisma: PrismaService) {}

  invalidateActive(email: string, purpose: OtpPurpose) {
    return this.prisma.otpVerification.updateMany({
      where: { email, purpose, consumed: false },
      data: { consumed: true },
    });
  }

  create(data: { email: string; purpose: OtpPurpose; codeHash: string; expiresAt: Date }) {
    return this.prisma.otpVerification.create({ data });
  }

  findLatestActive(email: string, purpose: OtpPurpose) {
    return this.prisma.otpVerification.findFirst({
      where: { email, purpose, consumed: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  incrementAttempts(id: string) {
    return this.prisma.otpVerification.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  }

  markConsumed(id: string) {
    return this.prisma.otpVerification.update({
      where: { id },
      data: { consumed: true },
    });
  }
}
