import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { tokenHash: string; utilisateurId: string; expiresAt: Date }) {
    return this.prisma.refreshToken.create({ data });
  }

  findByTokenHash(tokenHash: string) {
    return this.prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  revoke(id: string) {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
    });
  }

  revokeAllForUser(utilisateurId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { utilisateurId, revoked: false },
      data: { revoked: true },
    });
  }
}
