import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class OngProfileDto {
  @ApiProperty()
  @IsString()
  nomOrganisation!: string;

  @ApiProperty({
    type: [String],
    description: 'UUIDs des domaines (voir GET /reference/domaines-intervention)',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  domaineInterventionIds!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mission?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;
}
