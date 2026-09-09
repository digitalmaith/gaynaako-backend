// src/common/cloudinary/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';

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
              error instanceof Error
                ? error.message
                : (error?.message ?? "Échec de l'upload Cloudinary");
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

  async uploadDocument(buffer: Buffer, filename: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'gaynaako/documents',
          public_id: `${Date.now()}-${filename.split('.')[0]}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            const message =
              error instanceof Error
                ? error.message
                : (error?.message ?? "Échec de l'upload du document");
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

  async deleteByUrl(url: string): Promise<void> {
    const publicId = this.extractPublicId(url);
    if (!publicId) return; // URL non reconnue, on ignore plutôt que de planter

    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
    } catch {
      // Suppression best-effort : un échec ici ne doit pas bloquer la mise à jour du document
    }
  }

  private extractPublicId(url: string): string | null {
    // Format Cloudinary : .../upload/v<version>/<folder>/<public_id>.<ext>
    const match = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/.exec(url);
    return match ? match[1] : null;
  }
}
