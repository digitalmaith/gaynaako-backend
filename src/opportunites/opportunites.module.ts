import { Module } from '@nestjs/common';
import { OpportunitiesService } from './opportunites.service';
import { OpportunitesIaService } from './opportunites-ia.service';
import { OpportuniteRepository } from './repositories/opportunite.repository';
import { AdminOpportunitesController } from './controller/admin-opportunites.controller';
import { AiImportController } from './controller/ai-import.controller';
import { OpportunitesPublicController } from './controller/opportunites-public.controller';
import { OpportunitesIaController } from './controller/opportunites-ia.controller';
import { AuthModule } from '../auth/auth.module';
import { AiApiKeyGuard } from './guards/ai-api-key.guard';

@Module({
  imports: [AuthModule],
  controllers: [
    AdminOpportunitesController,
    AiImportController,
    OpportunitesPublicController,
    OpportunitesIaController,
  ],
  providers: [OpportunitiesService, OpportunitesIaService, OpportuniteRepository, AiApiKeyGuard],
  exports: [OpportunitiesService, OpportunitesIaService],
})
export class OpportunitesModule {}
