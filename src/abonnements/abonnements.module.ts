// src/abonnements/abonnements.module.ts
import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { AbonnementsController } from './abonnements.controller';
import { AbonnementsService } from './abonnements.service';
import { PlanRepository } from './repositories/plan.repository';
import { AbonnementRepository } from './repositories/abonnement.repository';
import { TransactionRepository } from './repositories/transaction.repository';
import { WavePaymentProvider } from './providers/wave-payment.provider';
import { OrangeMoneyPaymentProvider } from './providers/orange-money-payment.provider';
import {
  PAYMENT_PROVIDER_WAVE,
  PAYMENT_PROVIDER_ORANGE_MONEY,
} from './ports/payment-provider.port';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PlansController, AbonnementsController],
  providers: [
    PlansService,
    AbonnementsService,
    PlanRepository,
    AbonnementRepository,
    TransactionRepository,
    { provide: PAYMENT_PROVIDER_WAVE, useClass: WavePaymentProvider },
    { provide: PAYMENT_PROVIDER_ORANGE_MONEY, useClass: OrangeMoneyPaymentProvider },
  ],
})
export class AbonnementsModule {}
