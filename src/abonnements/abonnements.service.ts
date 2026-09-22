// src/abonnements/abonnements.service.ts
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AbonnementRepository } from './repositories/abonnement.repository';
import { TransactionRepository } from './repositories/transaction.repository';
import { PlanRepository } from './repositories/plan.repository';
import { SouscrireDto } from './dto/souscrire.dto';
import {
  FournisseurPaiement,
  StatutAbonnement,
  StatutTransaction,
} from '../generated/prisma/enums';
import {
  PAYMENT_PROVIDER_WAVE,
  PAYMENT_PROVIDER_ORANGE_MONEY,
} from './ports/payment-provider.port';
import type { PaymentProviderPort } from './ports/payment-provider.port';

@Injectable()
export class AbonnementsService {
  constructor(
    private readonly abonnementRepository: AbonnementRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly planRepository: PlanRepository,
    @Inject(PAYMENT_PROVIDER_WAVE) private readonly waveProvider: PaymentProviderPort,
    @Inject(PAYMENT_PROVIDER_ORANGE_MONEY)
    private readonly orangeMoneyProvider: PaymentProviderPort,
  ) {}

  private getProvider(fournisseur: FournisseurPaiement): PaymentProviderPort {
    return fournisseur === FournisseurPaiement.WAVE ? this.waveProvider : this.orangeMoneyProvider;
  }

  async getMonAbonnement(utilisateurId: string) {
    return this.abonnementRepository.findActifByUtilisateur(utilisateurId);
  }

  async souscrire(utilisateurId: string, utilisateurEmail: string, dto: SouscrireDto) {
    const plan = await this.planRepository.findById(dto.planId);
    if (!plan) throw new NotFoundException('Plan introuvable');

    const montant = dto.cycle === 'MENSUEL' ? plan.prixMensuel : plan.prixAnnuel;

    const abonnement = await this.abonnementRepository.create({
      utilisateurId,
      planId: dto.planId,
      cycle: dto.cycle,
    });

    const transaction = await this.transactionRepository.create({
      abonnementId: abonnement.id,
      fournisseur: dto.fournisseur,
      montant,
    });

    const provider = this.getProvider(dto.fournisseur);

    const { referenceExterne, urlPaiement } = await provider.initierPaiement({
      montant,
      referenceInterne: transaction.id,
      utilisateurEmail,
      urlRetour: `${process.env.FRONTEND_URL}/abonnement/confirmation`,
    });

    await this.transactionRepository.updateStatut(transaction.id, StatutTransaction.EN_ATTENTE, {
      referenceExterne,
    });

    return { abonnementId: abonnement.id, urlPaiement };
  }

  async traiterWebhookPaiement(
    fournisseur: FournisseurPaiement,
    payload: unknown,
    signature: string,
  ) {
    const provider = this.getProvider(fournisseur);

    if (!provider.verifierSignatureWebhook(payload, signature)) {
      throw new BadRequestException('Signature de webhook invalide');
    }

    const evenement = provider.parserWebhook(payload);

    const transaction = await this.transactionRepository.findByReferenceExterne(
      evenement.referenceExterne,
    );
    if (!transaction) throw new NotFoundException('Transaction introuvable');

    if (evenement.statut === 'REUSSIE') {
      await this.transactionRepository.updateStatut(transaction.id, StatutTransaction.REUSSIE, {
        dateConfirmation: new Date(),
        metadonnees: evenement.metadonnees,
      });

      const dateDebut = new Date();
      const dateFin = new Date(dateDebut);
      // durée ajustée selon le cycle réellement retrouvé via l'abonnement
      const abonnement = await this.abonnementRepository.findById(transaction.abonnementId);
      if (abonnement?.cycle === 'ANNUEL') {
        dateFin.setFullYear(dateFin.getFullYear() + 1);
      } else {
        dateFin.setMonth(dateFin.getMonth() + 1);
      }

      await this.abonnementRepository.updateStatut(
        transaction.abonnementId,
        StatutAbonnement.ACTIF,
        {
          dateDebut,
          dateFin,
        },
      );
    } else {
      await this.transactionRepository.updateStatut(transaction.id, StatutTransaction.ECHOUEE, {
        metadonnees: evenement.metadonnees,
      });
      await this.abonnementRepository.updateStatut(
        transaction.abonnementId,
        StatutAbonnement.ECHEC_PAIEMENT,
      );
    }

    return { message: 'Webhook traité' };
  }

  async annuler(id: string, utilisateurId: string) {
    const abonnement = await this.abonnementRepository.findById(id);
    if (!abonnement) throw new NotFoundException('Abonnement introuvable');
    if (abonnement.utilisateurId !== utilisateurId) {
      throw new BadRequestException('Cet abonnement ne vous appartient pas');
    }

    await this.abonnementRepository.softDelete(id);
    return { message: `Abonnement annulé (reste actif jusqu'à la fin de la période payée)` };
  }
}
