import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import type { FastifyRequest } from 'fastify';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/me/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  listMyDocuments(@CurrentUser() currentUser: JwtPayload) {
    return this.documentsService.listMyDocuments(currentUser.sub);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: [
            'CV',
            'PIECE_IDENTITE',
            'REGISTRE_COMMERCE',
            'NINEA',
            'STATUTS_ENTREPRISE',
            'ATTESTATION_FISCALE',
            'ATTESTATION_SOCIALE',
            'JUSTIFICATIF_DOMICILE',
            'ATTESTATION',
            'AUTRE',
          ],
        },
        libelle: { type: 'string' },
        document: { type: 'string', format: 'binary' },
      },
      required: ['type', 'libelle', 'document'],
    },
  })
  async uploadDocument(@Req() req: FastifyRequest, @CurrentUser() currentUser: JwtPayload) {
    const parts = req.parts();
    const fields: Record<string, string> = {};
    let file: { buffer: Buffer; filename: string; mimeType: string } | undefined;

    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'document') {
        file = {
          buffer: await part.toBuffer(),
          filename: part.filename,
          mimeType: part.mimetype,
        };
      } else if (part.type === 'field') {
        fields[part.fieldname] = part.value as string;
      }
    }

    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    return this.documentsService.uploadDocument(currentUser.sub, fields.type, fields.libelle, file);
  }

  @Delete(':id')
  deleteDocument(@Param('id') id: string, @CurrentUser() currentUser: JwtPayload) {
    return this.documentsService.deleteDocument(id, currentUser.sub);
  }
}
