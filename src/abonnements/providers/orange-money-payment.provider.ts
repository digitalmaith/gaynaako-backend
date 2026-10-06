// src/abonnements/providers/orange-money-payment.provider.ts
import { Injectable, NotImplementedException } from '@nestjs/common';
import {
  PaymentProviderPort,
  InitierPaiementParams,
  InitierPaiementResultat,
  WebhookPaiementPayload,
} from '../ports/payment-provider.port';

@Injectable()
export class OrangeMoneyPaymentProvider implements PaymentProviderPort {
  async initierPaiement(_params: InitierPaiementParams): Promise<InitierPaiementResultat> {
    // TODO : brancher l'API Orange Money une fois le compte marchand ouvert
    throw new NotImplementedException('Intégration Orange Money pas encore configurée');
  }

  verifierSignatureWebhook(_payload: unknown, _signature: string): boolean {
    throw new NotImplementedException('Intégration Orange Money pas encore configurée');
  }

  parserWebhook(_payload: unknown): WebhookPaiementPayload {
    throw new NotImplementedException('Intégration Orange Money pas encore configurée');
  }
}
