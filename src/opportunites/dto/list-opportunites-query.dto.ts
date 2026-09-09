// src/opportunites/dto/list-opportunites-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { OrigineOpportunite, TypeOpportunite } from '../../generated/prisma/enums';

export class ListOpportunitesQueryDto {
  @ApiPropertyOptional({ enum: TypeOpportunite })
  @IsOptional()
  @IsEnum(TypeOpportunite)
  type?: TypeOpportunite;

  @ApiPropertyOptional({ enum: OrigineOpportunite })
  @IsOptional()
  @IsEnum(OrigineOpportunite)
  origine?: OrigineOpportunite;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  secteurId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  inclureSupprimes?: boolean = false;

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
