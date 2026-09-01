import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { StatutEmetteur, TypeEmetteur } from '../../../generated/prisma/enums';

export class ListEmetteursQueryDto {
  @ApiPropertyOptional({ enum: TypeEmetteur })
  @IsOptional()
  @IsEnum(TypeEmetteur)
  type?: TypeEmetteur;

  @ApiPropertyOptional({ enum: StatutEmetteur })
  @IsOptional()
  @IsEnum(StatutEmetteur)
  statut?: StatutEmetteur;

  @ApiPropertyOptional({ description: 'Recherche par nom (partielle)' })
  @IsOptional()
  @IsString()
  search?: string;

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
