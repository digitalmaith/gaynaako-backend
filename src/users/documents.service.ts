import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentRepository } from './repositories/document.repository';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { TypeDocument } from '../generated/prisma/enums';

const TYPES_VALIDES = Object.values(TypeDocument);

@Injectable()
export class DocumentsService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly cloudinary: CloudinaryService,
  ) {}

  listMyDocuments(utilisateurId: string) {
    return this.documentRepository.findAllByUtilisateur(utilisateurId);
  }

  async uploadDocument(
    utilisateurId: string,
    type: string,
    libelle: string,
    file: { buffer: Buffer; filename: string; mimeType: string },
  ) {
    if (!TYPES_VALIDES.includes(type as TypeDocument)) {
      throw new BadRequestException(
        `Type de document invalide. Valeurs acceptées : ${TYPES_VALIDES.join(', ')}`,
      );
    }
    if (!libelle || libelle.trim().length < 2) {
      throw new BadRequestException('Le libellé du document est requis (2 caractères minimum)');
    }

    const url = await this.cloudinary.uploadDocument(file.buffer, file.filename);

    return this.documentRepository.create({
      utilisateurId,
      type: type as TypeDocument,
      libelle: libelle.trim(),
      url,
      nomFichier: file.filename,
      mimeType: file.mimeType,
      tailleOctets: file.buffer.length,
    });
  }

  async deleteDocument(id: string, utilisateurId: string) {
    const document = await this.documentRepository.findById(id);
    if (!document) throw new NotFoundException('Document introuvable');

    if (document.utilisateurId !== utilisateurId) {
      throw new ForbiddenException('Ce document ne vous appartient pas');
    }

    await this.documentRepository.delete(id);
    return { message: 'Document supprimé avec succès' };
  }
}
