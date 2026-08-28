import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class EntrepreneurProfileDto {
  @ApiProperty({ description: 'UUID du secteur (voir GET /reference/secteurs)' })
  @IsUUID()
  secteurId!: string;

  @ApiProperty({ description: 'UUID du pays (voir GET /reference/pays)' })
  @IsUUID()
  paysId!: string;

  @ApiProperty()
  @IsString()
  domaineExpertise!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  objectifs?: string;
}
