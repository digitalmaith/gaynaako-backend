// src/abonnements/providers/wave-payment.provider.ts
import { Injectable, NotImplementedException } from '@nestjs/common';
import {
  PaymentProviderPort,
  InitierPaiementParams,
  InitierPaiementResultat,
  WebhookPaiementPayload,
} from '../ports/payment-provider.port';

@Injectable()
export class WavePaymentProvider implements PaymentProviderPort {
  async initierPaiement(_params: InitierPaiementParams): Promise<InitierPaiementResultat> {
    // TODO : brancher l'API Wave une fois le compte marchand ouvert
    // Doc à suivre : https://docs.wave.com (checkout API)
    throw new NotImplementedException("Intégration Wave pas encore configurée");
  }

  verifierSignatureWebhook(_payload: unknown, _signature: string): boolean {
    throw new NotImplementedException("Intégration Wave pas encore configurée");
  }

  parserWebhook(_payload: unknown): WebhookPaiementPayload {
    throw new NotImplementedException("Intégration Wave pas encore configurée");
  }
}
