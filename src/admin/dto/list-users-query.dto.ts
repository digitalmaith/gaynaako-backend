// src/admin/dto/list-users-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { RoleUtilisateur, StatutUtilisateur } from '../../generated/prisma/enums';

export class ListUsersQueryDto {
  @ApiPropertyOptional({ enum: RoleUtilisateur })
  @IsOptional()
  @IsEnum(RoleUtilisateur)
  role?: RoleUtilisateur;

  @ApiPropertyOptional({ enum: StatutUtilisateur })
  @IsOptional()
  @IsEnum(StatutUtilisateur)
  statut?: StatutUtilisateur;

  @ApiPropertyOptional({ description: 'Recherche par email (partielle)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    default: false,
    description: 'Inclure les comptes supprimés (soft delete)',
  })
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
