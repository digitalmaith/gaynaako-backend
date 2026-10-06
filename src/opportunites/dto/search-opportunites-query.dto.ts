// src/opportunites/dto/search-opportunites-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { TypeOpportunite } from '../../generated/prisma/enums';

export class SearchOpportunitesQueryDto {
  @ApiPropertyOptional({ enum: TypeOpportunite })
  @IsOptional()
  @IsEnum(TypeOpportunite)
  type?: TypeOpportunite;

  @ApiPropertyOptional({ description: 'UUID du secteur (voir GET /reference/secteurs)' })
  @IsOptional()
  @IsUUID()
  secteurId?: string;

  @ApiPropertyOptional({ description: 'Recherche partielle sur le pays' })
  @IsOptional()
  @IsString()
  pays?: string;

  @ApiPropertyOptional({ description: 'Recherche dans le titre et la description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    default: false,
    description: 'Inclure les opportunités dont la date limite est dépassée',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  inclureExpirees?: boolean = false;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
