import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateOngProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nomOrganisation?: string;

  @ApiPropertyOptional({ type: [String], description: 'Remplace la liste actuelle de domaines' })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  domaineInterventionIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mission?: string;
}
