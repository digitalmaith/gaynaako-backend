// src/reference/reference.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReferenceService } from './reference.service';

@ApiTags('reference')
@Controller('reference')
export class ReferenceController {
  constructor(private readonly referenceService: ReferenceService) {}

  @Get('pays')
  getPays() {
    return this.referenceService.getPays();
  }

  @Get('secteurs')
  getSecteurs() {
    return this.referenceService.getSecteurs();
  }

  @Get('domaines-intervention')
  getDomainesIntervention() {
    return this.referenceService.getDomainesIntervention();
  }
}
