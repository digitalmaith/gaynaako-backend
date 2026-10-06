import { Body, Controller, Post, UseGuards, Logger } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { OpportunitiesService } from '../opportunites.service';
import { ImportOpportuniteDto } from '../dto/import-opportunite.dto';
import { AiApiKeyGuard } from '../guards/ai-api-key.guard';

@ApiTags('integrations')
@ApiSecurity('x-api-key')
@UseGuards(AiApiKeyGuard)
@Controller('integrations/ai/opportunites')
export class AiImportController {
  private readonly logger = new Logger(AiImportController.name);
  constructor(private readonly opportunitesService: OpportunitiesService) {}

  @Post()
  importOpportunite(@Body() dto: ImportOpportuniteDto) {
    return this.opportunitesService.importFromAi(dto);
  }
}
