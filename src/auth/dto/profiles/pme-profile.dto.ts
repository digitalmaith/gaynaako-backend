import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class PmeProfileDto {
  @ApiProperty()
  @IsString()
  nomEntreprise!: string;

  @ApiProperty({
    type: [String],
    description: 'UUIDs des secteurs (voir GET /reference/secteurs)',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  secteurIds!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;
}
