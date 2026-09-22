// src/abonnements/repositories/transaction.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FournisseurPaiement, StatutTransaction } from '../../generated/prisma/enums';

@Injectable()
export class TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    abonnementId: string;
    fournisseur: FournisseurPaiement;
    montant: number;
    referenceExterne?: string;
  }) {
    return this.prisma.transaction.create({ data });
  }

  findByReferenceExterne(referenceExterne: string) {
    return this.prisma.transaction.findUnique({ where: { referenceExterne } });
  }

  updateStatut(
    id: string,
    statut: StatutTransaction,
    data?: { referenceExterne?: string; dateConfirmation?: Date; metadonnees?: object },
  ) {
    return this.prisma.transaction.update({ where: { id }, data: { statut, ...data } });
  }
}
