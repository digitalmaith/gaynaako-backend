import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferenceService {
  constructor(private readonly prisma: PrismaService) {}

  getPays() {
    return this.prisma.pays.findMany({ orderBy: { nom: 'asc' } });
  }

  getSecteurs() {
    return this.prisma.secteur.findMany({ orderBy: { nom: 'asc' } });
  }

  getDomainesIntervention() {
    return this.prisma.domaineIntervention.findMany({ orderBy: { nom: 'asc' } });
  }
}
