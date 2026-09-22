import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TypeDocument } from '../../generated/prisma/enums';

export class UploadDocumentDto {
  @ApiProperty({ enum: TypeDocument })
  @IsEnum(TypeDocument)
  type!: TypeDocument;

  @ApiProperty({ description: 'Nom donné au document, ex: "CV 2026"' })
  @IsString()
  @MinLength(2)
  libelle!: string;

  @ApiPropertyOptional({ description: 'Date de fin de validité, si applicable (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateExpiration?: string;
}
