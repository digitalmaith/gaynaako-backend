// src/users/documents.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
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

const TAILLE_MAX_OCTETS = 10 * 1024 * 1024;
const SEUIL_BIENTOT_EXPIRE_JOURS = 30;

type StatutExpiration = 'VALIDE' | 'EXPIRE_BIENTOT' | 'EXPIRE' | 'SANS_EXPIRATION';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly cloudinary: CloudinaryService,
    private readonly http: HttpService,
  ) {}

  private calculerStatutExpiration(dateExpiration: Date | null): StatutExpiration {
    if (!dateExpiration) return 'SANS_EXPIRATION';
    const joursRestants = Math.ceil(
      (dateExpiration.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (joursRestants < 0) return 'EXPIRE';
    if (joursRestants <= SEUIL_BIENTOT_EXPIRE_JOURS) return 'EXPIRE_BIENTOT';
    return 'VALIDE';
  }

  private enrichir<T extends { id: string; publicId: string; dateExpiration: Date | null }>(
    document: T,
  ) {
    const { publicId: _publicId, ...rest } = document;
    return {
      ...rest,
      // Pas d'URL Cloudinary exposée — le frontend appelle GET /users/me/documents/:id/view (avec JWT)
      viewUrl: `/users/me/documents/${document.id}/view`,
      statutExpiration: this.calculerStatutExpiration(document.dateExpiration),
    };
  }

  async listMyDocuments(utilisateurId: string) {
    const documents = await this.documentRepository.findAllByUtilisateur(utilisateurId);
    return documents.map((doc) => this.enrichir(doc));
  }

  async uploadDocument(
    utilisateurId: string,
    type: string,
    libelle: string,
    dateExpiration: string | undefined,
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

    const { publicId, resourceType } = await this.cloudinary.uploadDocument(
      file.buffer,
      file.filename,
    );

    const document = await this.documentRepository.create({
      utilisateurId,
      type: type as TypeDocument,
      libelle: libelle.trim(),
      publicId,
      resourceType,
      nomFichier: file.filename,
      mimeType: file.mimeType,
      tailleOctets: file.buffer.length,
      dateExpiration: dateExpiration ? new Date(dateExpiration) : undefined,
    });

    return this.enrichir(document);
  }

  async updateDocument(
    id: string,
    utilisateurId: string,
    type: string | undefined,
    libelle: string | undefined,
    dateExpiration: string | undefined,
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
      publicId: string;
      resourceType: string;
      nomFichier: string;
      mimeType: string;
      tailleOctets: number;
      dateExpiration: Date | null;
    }> = {};

    if (type) updateData.type = type as TypeDocument;
    if (libelle) updateData.libelle = libelle.trim();
    if (dateExpiration !== undefined) {
      updateData.dateExpiration = dateExpiration ? new Date(dateExpiration) : null;
    }

    if (file) {
      this.validateFile(file);
      const { publicId, resourceType } = await this.cloudinary.uploadDocument(
        file.buffer,
        file.filename,
      );
      updateData.publicId = publicId;
      updateData.resourceType = resourceType;
      updateData.nomFichier = file.filename;
      updateData.mimeType = file.mimeType;
      updateData.tailleOctets = file.buffer.length;

      await this.cloudinary.deleteDocument(document.publicId, document.resourceType);
    }

    const updated = await this.documentRepository.update(id, updateData);
    return this.enrichir(updated);
  }

  async deleteDocument(id: string, utilisateurId: string) {
    const document = await this.documentRepository.findById(id);
    if (!document) throw new NotFoundException('Document introuvable');
    if (document.utilisateurId !== utilisateurId) {
      throw new ForbiddenException('Ce document ne vous appartient pas');
    }

    await this.cloudinary.deleteDocument(document.publicId, document.resourceType);
    await this.documentRepository.delete(id);
    return { message: 'Document supprimé avec succès' };
  }

  async streamDocument(
    id: string,
    utilisateurId: string,
  ): Promise<{ buffer: Buffer; mimeType: string; nomFichier: string }> {
    const document = await this.documentRepository.findById(id);
    if (!document) throw new NotFoundException('Document introuvable');
    if (document.utilisateurId !== utilisateurId) {
      throw new ForbiddenException('Ce document ne vous appartient pas');
    }

    const format = document.nomFichier.includes('.')
      ? document.nomFichier.split('.').pop()!
      : '';

    const downloadUrl = this.cloudinary.getPrivateDownloadUrl(
      document.publicId,
      document.resourceType,
      format,
    );

    const response = await firstValueFrom(
      this.http.get(downloadUrl, { responseType: 'arraybuffer' }),
    );

    return {
      buffer: Buffer.from(response.data as ArrayBuffer),
      mimeType: document.mimeType,
      nomFichier: document.nomFichier,
    };
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
