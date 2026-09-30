// src/opportunites/guards/ai-api-key.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyRequest } from 'fastify';

@Injectable()
export class AiApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const apiKey = request.headers['x-api-key'];
    const expectedKey = this.config.getOrThrow<string>('AI_INTEGRATION_API_KEY');

    if (!apiKey || apiKey !== expectedKey) {
      throw new UnauthorizedException('Clé API invalide ou manquante');
    }

    return true;
  }
}
