import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RecommandationsService } from './recommandations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { ListeRecommandationsResponseDto } from './dto/recommandation-response.dto';

@ApiTags('recommandations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recommandations')
export class RecommandationsController {
  constructor(private readonly recommandationsService: RecommandationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Lister mes recommandations',
    description:
      "Retourne les recommandations d'opportunités générées pour l'utilisateur connecté, " +
      'triées par score de pertinence décroissant.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'minScore',
    required: false,
    example: 0.55,
    description: 'Score minimum (0-1). Défaut : aucun filtre.',
  })
  @ApiOkResponse({ type: ListeRecommandationsResponseDto })
  list(
    @CurrentUser() currentUser: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('minScore') minScore?: string,
  ) {
    return this.recommandationsService.listMyRecommandations(currentUser.sub, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      minScore: minScore ? Number(minScore) : undefined,
    });
  }
}
