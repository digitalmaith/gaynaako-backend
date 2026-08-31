import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JournalRepository {
  constructor(private readonly prisma: PrismaService) {}

  log(administrateurId: string, action: string) {
    return this.prisma.journalActivite.create({
      data: { administrateurId, action },
    });
  }

  findAll(skip: number, take: number) {
    return this.prisma.journalActivite.findMany({
      orderBy: { dateHeure: 'desc' },
      skip,
      take,
      include: {
        administrateur: {
          include: { utilisateur: { select: { email: true } } },
        },
      },
    });
  }
}
