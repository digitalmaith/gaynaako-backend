import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { TypeSourceScraping } from '../../../generated/prisma/enums';

export class ListSourcesQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ enum: TypeSourceScraping })
  @IsOptional()
  @IsEnum(TypeSourceScraping)
  type?: TypeSourceScraping;

  @ApiPropertyOptional({ description: 'Filtrer par actif/inactif' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  actif?: boolean;

  @ApiPropertyOptional({ description: 'Recherche par nom ou URL' })
  @IsOptional()
  @IsString()
  search?: string;
}
