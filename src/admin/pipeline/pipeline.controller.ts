import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { AiApiKeyGuard } from '../../opportunites/guards/ai-api-key.guard';

@ApiTags('admin-pipeline')
@UseGuards(AiApiKeyGuard)
@Controller('admin/pipeline')
export class PipelineController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('notify')
  @ApiOperation({
    summary: "Déclenche l'envoi des notifications par email (appelé par l'IA après le matching)",
  })
  @ApiHeader({
    name: 'X-API-Key',
    description: "Clé d'intégration IA (AI_INTEGRATION_API_KEY)",
    required: true,
  })
  async notify() {
    const result = await this.notificationService.notifyNewRecommendations();
    return {
      ok: true,
      ...result,
      timestamp: new Date().toISOString(),
    };
  }
}
