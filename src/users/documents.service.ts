// src/users/documents.service.ts
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

const MIME_TYPES_AUTORISES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const TAILLE_MAX_OCTETS = 10 * 1024 * 1024; // 10 Mo

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
    this.validateFile(file);

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

  async updateDocument(
    id: string,
    utilisateurId: string,
    type: string | undefined,
    libelle: string | undefined,
    file: { buffer: Buffer; filename: string; mimeType: string } | undefined,
  ) {
    const document = await this.documentRepository.findById(id);
    if (!document) throw new NotFoundException('Document introuvable');

    if (document.utilisateurId !== utilisateurId) {
      throw new ForbiddenException('Ce document ne vous appartient pas');
    }

    if (type && !TYPES_VALIDES.includes(type as TypeDocument)) {
      throw new BadRequestException(
        `Type de document invalide. Valeurs acceptées : ${TYPES_VALIDES.join(', ')}`,
      );
    }

    const updateData: Partial<{
      type: TypeDocument;
      libelle: string;
      url: string;
      nomFichier: string;
      mimeType: string;
      tailleOctets: number;
    }> = {};

    if (type) updateData.type = type as TypeDocument;
    if (libelle) updateData.libelle = libelle.trim();

    if (file) {
      this.validateFile(file);

      const newUrl = await this.cloudinary.uploadDocument(file.buffer, file.filename);
      updateData.url = newUrl;
      updateData.nomFichier = file.filename;
      updateData.mimeType = file.mimeType;
      updateData.tailleOctets = file.buffer.length;

      await this.cloudinary.deleteByUrl(document.url);
    }

    return this.documentRepository.update(id, updateData);
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

  private validateFile(file: { buffer: Buffer; mimeType: string }): void {
    if (!MIME_TYPES_AUTORISES.has(file.mimeType)) {
      throw new BadRequestException(
        `Type de fichier non autorisé (${file.mimeType}). Formats acceptés : PDF, JPEG, PNG, WEBP, DOC, DOCX`,
      );
    }
    if (file.buffer.length > TAILLE_MAX_OCTETS) {
      throw new BadRequestException('Fichier trop volumineux (10 Mo maximum)');
    }
  }
}
