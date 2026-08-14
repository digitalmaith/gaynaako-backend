import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../generated/prisma/enums';

export interface UpsertPendingRegistrationData {
  email: string;
  passwordHash: string;
  role: Role;
  firstName?: string | null;
  lastName?: string | null;
  organizationName?: string | null;
  logoUrl?: string | null;
}

@Injectable()
export class PendingRegistrationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.pendingRegistration.findUnique({ where: { email } });
  }

  upsert(data: UpsertPendingRegistrationData) {
    return this.prisma.pendingRegistration.upsert({
      where: { email: data.email },
      create: data,
      update: {
        passwordHash: data.passwordHash,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        organizationName: data.organizationName,
        logoUrl: data.logoUrl,
      },
    });
  }

  delete(email: string) {
    return this.prisma.pendingRegistration.delete({ where: { email } });
  }
}
