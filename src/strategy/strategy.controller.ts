import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StrategyService } from './strategy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('strategy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('strategy')
export class StrategyController {
  constructor(private readonly strategyService: StrategyService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtenir ma stratégie personnalisée',
    description:
      "Analyse le profil de l'utilisateur connecté face au marché pour générer " +
      "sa roadmap, sa matrice de priorisation et sa Gap Analysis via l'IA.",
  })
  async getMyStrategy(@CurrentUser() currentUser: JwtPayload) {
    // currentUser.sub contient l'ID de l'utilisateur (extrait du JWT)
    return this.strategyService.getUserStrategy(currentUser.sub);
  }
}
