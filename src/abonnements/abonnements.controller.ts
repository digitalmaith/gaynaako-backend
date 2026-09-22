// src/abonnements/abonnements.controller.ts
import { Body, Controller, Delete, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AbonnementsService } from './abonnements.service';
import { SouscrireDto } from './dto/souscrire.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FournisseurPaiement } from '../generated/prisma/enums';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('abonnements')
@Controller()
export class AbonnementsController {
  constructor(private readonly abonnementsService: AbonnementsService) {}

  @Get('abonnements/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMonAbonnement(@CurrentUser() currentUser: JwtPayload) {
    return this.abonnementsService.getMonAbonnement(currentUser.sub);
  }

  @Post('abonnements')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  souscrire(@Body() dto: SouscrireDto, @CurrentUser() currentUser: JwtPayload) {
    return this.abonnementsService.souscrire(currentUser.sub, currentUser.email, dto);
  }

  @Delete('abonnements/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  annuler(@Param('id') id: string, @CurrentUser() currentUser: JwtPayload) {
    return this.abonnementsService.annuler(id, currentUser.sub);
  }

  // Endpoint public : appelé par Wave/Orange Money, pas par notre frontend.
  // La sécurité vient de verifierSignatureWebhook, pas d'un JWT.
  @Post('webhooks/paiement/:fournisseur')
  webhook(
    @Param('fournisseur') fournisseur: FournisseurPaiement,
    @Body() payload: unknown,
    @Headers('x-signature') signature: string,
  ) {
    return this.abonnementsService.traiterWebhookPaiement(fournisseur, payload, signature);
  }
}
