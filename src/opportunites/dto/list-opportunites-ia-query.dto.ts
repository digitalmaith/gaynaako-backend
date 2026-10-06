// src/opportunites/dto/list-opportunites-ia-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListOpportunitesIaQueryDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['national', 'international'] })
  @IsOptional()
  @IsEnum(['national', 'international'])
  sourceType?: 'national' | 'international';

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minQuality?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  opportunityType?: string;
}
