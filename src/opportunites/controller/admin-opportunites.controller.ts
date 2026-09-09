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
import { OpportunitesService } from '../opportunites.service';
import { CreateOpportuniteDto } from '../dto/create-opportunite.dto';
import { UpdateOpportuniteDto } from '../dto/update-opportunite.dto';
import { ListOpportunitesQueryDto } from '../dto/list-opportunites-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RoleUtilisateur } from '../../generated/prisma/enums';
import { UtilisateurRepository } from '../../auth/repositories/utilisateur.repository';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleUtilisateur.ADMINISTRATEUR)
@Controller('admin/opportunites')
export class AdminOpportunitesController {
  constructor(
    private readonly opportunitesService: OpportunitesService,
    private readonly utilisateurRepository: UtilisateurRepository,
  ) {}

  @Get()
  list(@Query() query: ListOpportunitesQueryDto) {
    return this.opportunitesService.listOpportunites(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.opportunitesService.getById(id);
  }

  @Post()
  async create(@Body() dto: CreateOpportuniteDto, @CurrentUser() currentUser: JwtPayload) {
    const adminProfile = await this.utilisateurRepository.findAdministrateurProfileByUtilisateurId(
      currentUser.sub,
    );
    return this.opportunitesService.createManuelle(dto, adminProfile?.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOpportuniteDto) {
    return this.opportunitesService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.opportunitesService.delete(id);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.opportunitesService.restore(id);
  }
}
