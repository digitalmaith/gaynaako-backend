import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class PmeProfileDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  nomEntreprise!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  secteursActivite!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;
}
