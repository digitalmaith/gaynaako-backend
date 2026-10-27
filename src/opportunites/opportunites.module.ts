import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // 👈 Ajouté
import { OpportunitiesService } from './opportunites.service';
import { OpportunitesIaService } from './opportunites-ia.service';
import { OpportuniteRepository } from './repositories/opportunite.repository';
import { AdminOpportunitesController } from './controller/admin-opportunites.controller';
import { AiImportController } from './controller/ai-import.controller';
import { OpportunitesPublicController } from './controller/opportunites-public.controller';
import { OpportunitesIaController } from './controller/opportunites-ia.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module'; // 👈 Ajouté (si ton repo est dedans)
import { AiApiKeyGuard } from './guards/ai-api-key.guard';
import { UtilisateurRepository } from '../auth/repositories/utilisateur.repository'; // 👈 Ajouté

@Module({
  imports: [
    ConfigModule, // 👈 Nécessaire pour ConfigService dans le service
    AuthModule,
    UsersModule, // 👈 Assure-toi que UsersModule exporte UtilisateurRepository
  ],
  controllers: [
    AdminOpportunitesController,
    AiImportController,
    OpportunitesPublicController,
    OpportunitesIaController,
  ],
  providers: [
    OpportunitiesService,
    OpportunitesIaService,
    OpportuniteRepository,
    UtilisateurRepository, // 👈 Ajouté si UsersModule ne l'exporte pas
    AiApiKeyGuard,
  ],
  exports: [OpportunitiesService, OpportunitesIaService],
})
export class OpportunitesModule {}
