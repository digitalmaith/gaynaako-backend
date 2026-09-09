import { Module } from '@nestjs/common';
import { CandidaturesController } from './candidatures.controller';
import { CandidaturesService } from './candidatures.service';
import { CandidatureRepository } from './repositories/candidature.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CandidaturesController],
  providers: [CandidaturesService, CandidatureRepository],
})
export class CandidaturesModule {}
