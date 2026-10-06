// src/opportunites/controller/admin-opportunites.controller.ts
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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OpportunitiesService } from '../opportunites.service';
import { OpportunitesIaService } from '../opportunites-ia.service';
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
    private readonly opportunitesService: OpportunitiesService,
    private readonly opportunitesIaService: OpportunitesIaService,
    private readonly utilisateurRepository: UtilisateurRepository,
  ) {}

  // ============================================================
  // CRUD existant (table `opportunites`)
  // ============================================================

  @Get()
  @ApiOperation({ summary: 'Liste des opportunités (manuelles)' })
  list(@Query() query: ListOpportunitesQueryDto) {
    return this.opportunitesService.listOpportunites(query);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une opportunité manuelle' })
  async create(@Body() dto: CreateOpportuniteDto, @CurrentUser() currentUser: JwtPayload) {
    const adminProfile = await this.utilisateurRepository.findAdministrateurProfileByUtilisateurId(
      currentUser.sub,
    );
    return this.opportunitesService.createManuelle(dto, adminProfile?.id);
  }

  // ============================================================
  // IA — Lecture des opportunités collectées (opportunities_processed)
  // ⚠️ Doit être AVANT @Get(':id')
  // ============================================================

  @Get('ia')
  @ApiOperation({ summary: 'Liste des opportunités collectées par l’IA' })
  listIa(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('country') country?: string,
    @Query('sector') sector?: string,
    @Query('search') search?: string,
    @Query('sourceType') sourceType?: 'national' | 'international',
    @Query('minQuality') minQuality?: string,
    @Query('opportunityType') opportunityType?: string,
  ) {
    return this.opportunitesIaService.list({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      country,
      sector,
      search,
      sourceType,
      minQuality: minQuality ? parseInt(minQuality, 10) : undefined,
      opportunityType,
    });
  }

  @Get('ia/stats')
  @ApiOperation({ summary: 'Statistiques globales des opportunités IA' })
  getIaStats() {
    return this.opportunitesIaService.getStats();
  }

  @Get('ia/countries')
  @ApiOperation({ summary: 'Pays avec le nombre d’opportunités IA' })
  getIaCountries() {
    return this.opportunitesIaService.getCountries();
  }

  @Get('ia/:id')
  @ApiOperation({ summary: 'Détail d’une opportunité IA' })
  getIaById(@Param('id') id: string) {
    return this.opportunitesIaService.getById(id);
  }

  // ============================================================
  // CRUD par ID (DOIT être après les routes spécifiques)
  // ============================================================

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’une opportunité manuelle' })
  getById(@Param('id') id: string) {
    return this.opportunitesService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une opportunité manuelle' })
  update(@Param('id') id: string, @Body() dto: UpdateOpportuniteDto) {
    return this.opportunitesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une opportunité manuelle' })
  delete(@Param('id') id: string) {
    return this.opportunitesService.delete(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restaurer une opportunité supprimée' })
  restore(@Param('id') id: string) {
    return this.opportunitesService.restore(id);
  }
}
