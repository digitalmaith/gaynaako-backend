import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { StatutCandidature } from '../../generated/prisma/enums';

export class ListCandidaturesQueryDto {
  @ApiPropertyOptional({ enum: StatutCandidature })
  @IsOptional()
  @IsEnum(StatutCandidature)
  statut?: StatutCandidature;

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
