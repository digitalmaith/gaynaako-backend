import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class OngProfileDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  nomOrganisation!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  domainesIntervention!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mission?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;
}
