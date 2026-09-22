// src/abonnements/ports/payment-provider.port.ts
export interface InitierPaiementParams {
  montant: number;
  referenceInterne: string; // l'ID de notre Transaction
  utilisateurEmail: string;
  utilisateurTelephone?: string;
  urlRetour: string;
}

export interface InitierPaiementResultat {
  referenceExterne: string;
  urlPaiement: string; // URL vers laquelle rediriger l'utilisateur (Wave/Orange Money)
}

export interface WebhookPaiementPayload {
  referenceExterne: string;
  statut: 'REUSSIE' | 'ECHOUEE';
  montant: number;
  metadonnees: Record<string, unknown>;
}

export interface PaymentProviderPort {
  initierPaiement(params: InitierPaiementParams): Promise<InitierPaiementResultat>;
  verifierSignatureWebhook(payload: unknown, signature: string): boolean;
  parserWebhook(payload: unknown): WebhookPaiementPayload;
}

export const PAYMENT_PROVIDER_WAVE = 'PAYMENT_PROVIDER_WAVE';
export const PAYMENT_PROVIDER_ORANGE_MONEY = 'PAYMENT_PROVIDER_ORANGE_MONEY';
