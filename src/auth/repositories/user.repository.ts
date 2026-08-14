import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../generated/prisma/enums';

export interface CreateUserData {
  email: string;
  password: string;
  role: Role;
  firstName?: string | null;
  lastName?: string | null;
  organizationName?: string | null;
  logoUrl?: string | null;
  isEmailVerified: boolean;
}

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: CreateUserData) {
    return this.prisma.user.create({ data });
  }

  updatePassword(email: string, password: string) {
    return this.prisma.user.update({
      where: { email },
      data: { password },
    });
  }
}
