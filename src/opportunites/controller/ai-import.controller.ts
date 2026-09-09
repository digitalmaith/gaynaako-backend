import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OpportunitesService } from '../opportunites.service';
import { ImportOpportuniteDto } from '../dto/import-opportunite.dto';

// ⚠️  sécurité : cet endpoint n'a AUCUNE protection pour l'instant.
// Une fois le mécanisme d'authentification convenu avec l'équipe IA
// (clé API, JWT dédié...), ajouter le guard correspondant ici.
@ApiTags('integrations')
@Controller('integrations/ai/opportunites')
export class AiImportController {
  constructor(private readonly opportunitesService: OpportunitesService) {}

  @Post()
  import(@Body() dto: ImportOpportuniteDto) {
    return this.opportunitesService.importFromAi(dto);
  }
}
