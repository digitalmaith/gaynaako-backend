import { Module } from '@nestjs/common';
import { RecommandationsController } from './recommandations.controller';
import { RecommandationsService } from './recommandations.service';
import { RecommandationRepository } from './repositories/recommandation.repository';

@Module({
  controllers: [RecommandationsController],
  providers: [RecommandationsService, RecommandationRepository],
  exports: [RecommandationsService],
})
export class RecommandationsModule {}
