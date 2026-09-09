import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdatePmeProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nomEntreprise?: string;

  @ApiPropertyOptional({ type: [String], description: 'Remplace la liste actuelle de secteurs' })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  secteurIds?: string[];
}
