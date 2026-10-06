import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateSessionDto } from './dto/create-session.dto';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Envoyer un message au chatbot' })
  @ApiResponse({ status: 200, description: 'Réponse du chatbot' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 503, description: 'Chatbot indisponible' })
  send(@Body() dto: SendMessageDto, @Req() req: FastifyRequest) {
    const userId = this.extractUserId(req);
    return this.chatService.sendMessage(dto, userId);
  }

  @Post('session')
  @ApiOperation({ summary: 'Créer une nouvelle session de chat' })
  createSession(@Body() dto: CreateSessionDto, @Req() req: FastifyRequest) {
    const userId = this.extractUserId(req);
    return this.chatService.createSession(dto, userId);
  }

  @Get('session/:id/history')
  @ApiOperation({ summary: "Historique d'une session" })
  getHistory(@Param('id') sessionId: string, @Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.chatService.getHistory(sessionId, parsedLimit);
  }

  @Delete('session/:id')
  @ApiOperation({ summary: 'Supprimer une conversation' })
  @ApiResponse({ status: 200, description: 'Conversation supprimée' })
  @ApiResponse({ status: 404, description: 'Conversation introuvable' })
  deleteSession(@Param('id') sessionId: string) {
    return this.chatService.deleteSession(sessionId);
  }

  @Get('sessions/me')
  @ApiOperation({ summary: 'Mes sessions de chat' })
  getMySessions(@Req() req: FastifyRequest) {
    const userId = this.extractUserId(req);
    return this.chatService.getUserSessions(userId);
  }

  @Get('health')
  @ApiOperation({ summary: 'Santé du service chatbot' })
  health() {
    return this.chatService.health();
  }

  private extractUserId(req: FastifyRequest): string {
    const user = (req as any).user as { sub?: string } | undefined;

    if (!user?.sub) {
      throw new UnauthorizedException("Token JWT invalide : 'sub' manquant.");
    }

    return user.sub;
  }
}
