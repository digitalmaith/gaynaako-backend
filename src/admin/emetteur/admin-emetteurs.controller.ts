import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminEmetteursService } from './admin-emetteurs.service';
import { CreateEmetteurDto } from '../dto/emetteur/create-emetteur.dto';
import { UpdateEmetteurDto } from '../dto/emetteur/update-emetteur.dto';
import { UpdateEmetteurStatutDto } from '../dto/emetteur/update-emetteur-statut.dto';
import { ListEmetteursQueryDto } from '../dto/emetteur/list-emetteurs-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RoleUtilisateur } from '../../generated/prisma/enums';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleUtilisateur.ADMINISTRATEUR)
@Controller('admin/emetteurs')
export class AdminEmetteursController {
  constructor(private readonly adminEmetteursService: AdminEmetteursService) {}

  @Get()
  listEmetteurs(@Query() query: ListEmetteursQueryDto) {
    return this.adminEmetteursService.listEmetteurs(query);
  }

  @Get(':id')
  getEmetteur(@Param('id') id: string) {
    return this.adminEmetteursService.getEmetteurById(id);
  }

  @Post()
  createEmetteur(@Body() dto: CreateEmetteurDto, @CurrentUser() currentUser: JwtPayload) {
    return this.adminEmetteursService.createEmetteur(dto, currentUser.sub);
  }

  @Patch(':id')
  updateEmetteur(
    @Param('id') id: string,
    @Body() dto: UpdateEmetteurDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.adminEmetteursService.updateEmetteur(id, dto, currentUser.sub);
  }

  @Patch(':id/statut')
  updateStatut(
    @Param('id') id: string,
    @Body() dto: UpdateEmetteurStatutDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.adminEmetteursService.updateStatut(id, dto.statut, currentUser.sub);
  }

  @Delete(':id')
  deleteEmetteur(@Param('id') id: string, @CurrentUser() currentUser: JwtPayload) {
    return this.adminEmetteursService.deleteEmetteur(id, currentUser.sub);
  }
}
