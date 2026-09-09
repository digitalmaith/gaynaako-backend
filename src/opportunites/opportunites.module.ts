// src/opportunites/opportunites.module.ts
import { Module } from '@nestjs/common';
import { OpportunitesService } from './opportunites.service';
import { OpportuniteRepository } from './repositories/opportunite.repository';
import { AdminOpportunitesController } from './controller/admin-opportunites.controller';
import { AiImportController } from './controller/ai-import.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminOpportunitesController, AiImportController],
  providers: [OpportunitesService, OpportuniteRepository],
})
export class OpportunitesModule {}
