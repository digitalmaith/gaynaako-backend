import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { TypeOpportunite } from '../../generated/prisma/enums';

export class CreateOpportuniteDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  titre!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  description!: string;

  @ApiProperty({ enum: TypeOpportunite })
  @IsEnum(TypeOpportunite)
  type!: TypeOpportunite;

  @ApiProperty()
  @IsString()
  pays!: string;

  @ApiProperty()
  @IsDateString()
  dateLimite!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  criteresEligibilite?: string;

  @ApiProperty({ description: 'UUID du secteur (voir GET /reference/secteurs)' })
  @IsUUID()
  secteurId!: string;

  @ApiPropertyOptional({ description: "UUID de l'émetteur source (optionnel)" })
  @IsOptional()
  @IsUUID()
  emetteurId?: string;
}
