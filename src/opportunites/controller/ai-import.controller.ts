// src/opportunites/controller/ai-import.controller.ts
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { OpportunitesService } from '../opportunites.service';
import { ImportOpportuniteDto } from '../dto/import-opportunite.dto';
import { AiApiKeyGuard } from '../guards/ai-api-key.guard';

@ApiTags('integrations')
@ApiSecurity('x-api-key')
@UseGuards(AiApiKeyGuard)
@Controller('integrations/ai/opportunites')
export class AiImportController {
  constructor(private readonly opportunitesService: OpportunitesService) {}

  @Post()
  import(@Body() dto: ImportOpportuniteDto) {
    return this.opportunitesService.importFromAi(dto); // ✅
  }
}
