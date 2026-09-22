import { Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import type { FastifyReply, FastifyRequest } from 'fastify';

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
        dateExpiration: { type: 'string', format: 'date', description: 'Optionnel, YYYY-MM-DD' },
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

    return this.documentsService.uploadDocument(
      currentUser.sub,
      fields.type,
      fields.libelle,
      fields.dateExpiration,
      file,
    );
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: [/* ... */] },
        libelle: { type: 'string' },
        dateExpiration: { type: 'string', format: 'date' },
        document: { type: 'string', format: 'binary' },
      },
    },
  })
  async updateDocument(
    @Param('id') id: string,
    @Req() req: FastifyRequest,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    const parts = req.parts();
    const fields: Record<string, string> = {};
    let file: { buffer: Buffer; filename: string; mimeType: string } | undefined;

    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'document') {
        file = { buffer: await part.toBuffer(), filename: part.filename, mimeType: part.mimetype };
      } else if (part.type === 'field') {
        fields[part.fieldname] = part.value as string;
      }
    }

    return this.documentsService.updateDocument(
      id,
      currentUser.sub,
      fields.type,
      fields.libelle,
      fields.dateExpiration,
      file,
    );
  }

  @Delete(':id')
  deleteDocument(@Param('id') id: string, @CurrentUser() currentUser: JwtPayload) {
    return this.documentsService.deleteDocument(id, currentUser.sub);
  }

  @Get(':id/view')
  async viewDocument(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayload,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { buffer, mimeType, nomFichier } = await this.documentsService.streamDocument(
      id,
      currentUser.sub,
    );

    reply.header('Content-Type', mimeType);
    reply.header('Content-Disposition', `inline; filename="${nomFichier}"`);

    return buffer;
  }
}
