import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OpportunitesIaService } from '../opportunites-ia.service';
import { ListOpportunitesIaQueryDto } from '../dto/list-opportunites-ia-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy';

@ApiTags('opportunites-ia')
@Controller('opportunites-ia')
export class OpportunitesIaController {
  constructor(private readonly opportunitesIaService: OpportunitesIaService) {}

  @Get()
  @ApiOperation({ summary: "Liste des opportunités collectées par l'IA" })
  list(@Query() query: ListOpportunitesIaQueryDto) {
    return this.opportunitesIaService.list({
      page: query.page,
      limit: query.limit,
      country: query.country,
      sector: query.sector,
      search: query.search,
      sourceType: query.sourceType,
      minQuality: query.minQuality,
      opportunityType: query.opportunityType,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques globales des opportunités IA' })
  getStats() {
    return this.opportunitesIaService.getStats();
  }

  @Get('countries')
  @ApiOperation({ summary: 'Liste des pays avec le nombre d’opportunités' })
  getCountries() {
    return this.opportunitesIaService.getCountries();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Détail d'une opportunité IA avec score de matching" })
  getById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.opportunitesIaService.getByIdWithMatch(id, user.sub);
  }
}
