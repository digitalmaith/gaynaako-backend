import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { StrategyResponse } from './interfaces/strategy.interface';

@Injectable()
export class StrategyService {
  private readonly logger = new Logger(StrategyService.name);
  private readonly iaEngineUrl: string;

  constructor(private readonly config: ConfigService) {
    this.iaEngineUrl = this.config.get<string>('IA_ENGINE_URL', 'http://localhost:3000');
  }

  async getUserStrategy(utilisateurId: string): Promise<StrategyResponse> {
    try {
      this.logger.debug(`Appel du moteur IA pour la stratégie de ${utilisateurId}`);

      const response = await fetch(`${this.iaEngineUrl}/api/strategy/${utilisateurId}`);

      if (!response.ok) {
        throw new Error(`Le moteur IA a répondu avec le statut ${response.status}`);
      }

      // ✅ Cast explicite après vérification
      const data = (await response.json()) as StrategyResponse;
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`Erreur lors de l'appel au moteur IA : ${message}`);
      throw new HttpException(
        'Le service de stratégie IA est temporairement indisponible.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
