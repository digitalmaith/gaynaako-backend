// src/abonnements/repositories/plan.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllActifs() {
    return this.prisma.plan.findMany({
      where: { actif: true },
      include: { fonctionnalites: true },
      orderBy: { ordreAffichage: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.plan.findUnique({
      where: { id },
      include: { fonctionnalites: true },
    });
  }

  findByNom(nom: string) {
    return this.prisma.plan.findUnique({ where: { nom } });
  }

  create(data: {
    nom: string;
    description?: string;
    prixMensuel: number;
    prixAnnuel: number;
    ordreAffichage?: number;
  }) {
    return this.prisma.plan.create({ data });
  }

  update(
    id: string,
    data: Partial<{
      nom: string;
      description: string;
      prixMensuel: number;
      prixAnnuel: number;
      actif: boolean;
      ordreAffichage: number;
    }>,
  ) {
    return this.prisma.plan.update({ where: { id }, data });
  }

  setFonctionnalite(planId: string, cle: string, valeur: string) {
    return this.prisma.planFonctionnalite.upsert({
      where: { planId_cle: { planId, cle } },
      create: { planId, cle, valeur },
      update: { valeur },
    });
  }

  removeFonctionnalite(planId: string, cle: string) {
    return this.prisma.planFonctionnalite.delete({
      where: { planId_cle: { planId, cle } },
    });
  }
}
