// src/common/cloudinary/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadLogo(buffer: Buffer, filename: string): Promise<string> {
    // logos : publics par nature (affichés aux autres utilisateurs), inchangé
    return new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'gaynaako/logos',
          public_id: filename.split('.')[0],
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            const message =
              error instanceof Error ? error.message : (error?.message ?? "Échec de l'upload Cloudinary");
            reject(new Error(message));
            return;
          }
          if (!result) {
            reject(new Error("Cloudinary n'a retourné aucun résultat"));
            return;
          }
          resolve(result.secure_url);
        },
      );
      Readable.from(buffer).pipe(stream);
    });
  }

  async uploadDocument(
    buffer: Buffer,
    filename: string,
  ): Promise<{ publicId: string; resourceType: string }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'gaynaako/documents',
          public_id: `${Date.now()}-${filename.split('.')[0]}`,
          resource_type: 'auto',
          type: 'authenticated', // jamais accessible via une URL directe non signée
        },
        (error, result) => {
          if (error) {
            const message =
              error instanceof Error ? error.message : (error?.message ?? "Échec de l'upload du document");
            reject(new Error(message));
            return;
          }
          if (!result) {
            reject(new Error("Cloudinary n'a retourné aucun résultat"));
            return;
          }
          resolve({ publicId: result.public_id, resourceType: result.resource_type });
        },
      );
      Readable.from(buffer).pipe(stream);
    });
  }

  getSignedDocumentUrl(publicId: string, resourceType: string, format: string): string {
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      type: 'authenticated',
      sign_url: true,
      format,
    });
  }

  getPrivateDownloadUrl(publicId: string, resourceType: string, format: string): string {
    const expiresAt = Math.floor(Date.now() / 1000) + 60; // 60s — jamais exposé au client, juste le temps du fetch serveur

    return cloudinary.utils.private_download_url(publicId, format, {
      resource_type: resourceType,
      type: 'authenticated',
      expires_at: expiresAt,
    });
  }

  async deleteDocument(publicId: string, resourceType: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        type: 'authenticated',
      });
    } catch {
      // Suppression best-effort : un échec ici ne doit pas bloquer l'opération utilisateur
    }
  }
}
