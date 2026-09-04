import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength } from 'class-validator';
import { TypeDocument } from '../../generated/prisma/enums';

export class UploadDocumentDto {
  @ApiProperty({ enum: TypeDocument })
  @IsEnum(TypeDocument)
  type!: TypeDocument;

  @ApiProperty({ description: 'Nom donné au document, ex: "CV 2026"' })
  @IsString()
  @MinLength(2)
  libelle!: string;
}
