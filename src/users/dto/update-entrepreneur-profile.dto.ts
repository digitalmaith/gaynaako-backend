import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateEntrepreneurProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  secteurId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  paysId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  domaineExpertise?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  objectifs?: string;
}
