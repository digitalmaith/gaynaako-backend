import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { RoleUtilisateur } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';

export interface UpsertPendingRegistrationData {
  email: string;
  motDePasse: string;
  role: RoleUtilisateur;
  donneesProfil: Prisma.InputJsonValue;
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
        motDePasse: data.motDePasse,
        role: data.role,
        donneesProfil: data.donneesProfil,
      },
    });
  }

  delete(email: string) {
    return this.prisma.pendingRegistration.delete({ where: { email } });
  }
}
