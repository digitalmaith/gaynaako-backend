import { Module } from '@nestjs/common';
import { FavorisController } from './favoris.controller';
import { FavorisService } from './favoris.service';
import { FavoriRepository } from './repositories/favori.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FavorisController],
  providers: [FavorisService, FavoriRepository],
})
export class FavorisModule {}
