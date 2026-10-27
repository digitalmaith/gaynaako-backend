// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { ReferenceModule } from './reference/reference.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';
import { OpportunitesModule } from './opportunites/opportunites.module';
import { CandidaturesModule } from './candidatures/candidatures.module';
import { FavorisModule } from './favoris/favoris.module';
import { AbonnementsModule } from './abonnements/abonnements.module';
import { ChatModule } from './chat/chat.module';
import { RecommandationsModule } from './recommandations/recommandations.module';
import { PipelineModule } from './admin/pipeline/pipeline.module';
import { StrategyModule } from './strategy/strategy.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requêtes/minute par IP, par défaut sur toutes les routes
      },
    ]),
    PrismaModule,
    AuthModule,
    CloudinaryModule,
    ReferenceModule,
    AdminModule,
    UsersModule,
    OpportunitesModule,
    CandidaturesModule,
    FavorisModule,
    AbonnementsModule,
    ChatModule,
    RecommandationsModule,
    PipelineModule,
    StrategyModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
