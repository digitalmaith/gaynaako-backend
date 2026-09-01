import { Module } from '@nestjs/common';
import { AdminUsersController } from './user/admin-users.controller';
import { AdminUsersService } from './user/admin-users.service';
import { JournalRepository } from './repositories/journal.repository';
import { AuthModule } from '../auth/auth.module';
import { AdminEmetteursController } from './emetteur/admin-emetteurs.controller';
import { EmetteurRepository } from './repositories/emetteur.repository';
import { AdminEmetteursService } from './emetteur/admin-emetteurs.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminUsersController, AdminEmetteursController],
  providers: [AdminUsersService, JournalRepository, AdminEmetteursService, EmetteurRepository],
})
export class AdminModule {}
