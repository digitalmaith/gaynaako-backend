// src/opportunites/controller/opportunites-public.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OpportunitiesService } from '../opportunites.service';
import { SearchOpportunitesQueryDto } from '../dto/search-opportunites-query.dto';

@ApiTags('opportunites')
@Controller('opportunites')
export class OpportunitesPublicController {
  constructor(private readonly opportunitesService: OpportunitiesService) {}

  @Get()
  search(@Query() query: SearchOpportunitesQueryDto) {
    return this.opportunitesService.searchPublic(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.opportunitesService.getById(id);
  }
}
