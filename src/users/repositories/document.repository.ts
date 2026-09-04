import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TypeDocument } from '../../generated/prisma/enums';

export interface CreateDocumentData {
  utilisateurId: string;
  type: TypeDocument;
  libelle: string;
  url: string;
  nomFichier: string;
  mimeType: string;
  tailleOctets: number;
}

@Injectable()
export class DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUtilisateur(utilisateurId: string) {
    return this.prisma.documentUtilisateur.findMany({
      where: { utilisateurId },
      orderBy: { dateAjout: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.documentUtilisateur.findUnique({ where: { id } });
  }

  create(data: CreateDocumentData) {
    return this.prisma.documentUtilisateur.create({ data });
  }

  delete(id: string) {
    return this.prisma.documentUtilisateur.delete({ where: { id } });
  }
}
