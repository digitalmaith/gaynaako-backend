// src/opportunites/controller/opportunites-ia.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OpportunitesIaService } from '../opportunites-ia.service';
import { ListOpportunitesIaQueryDto } from '../dto/list-opportunites-ia-query.dto';

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
  @ApiOperation({ summary: "Détail d'une opportunité IA" })
  getById(@Param('id') id: string) {
    return this.opportunitesIaService.getById(id);
  }
}
