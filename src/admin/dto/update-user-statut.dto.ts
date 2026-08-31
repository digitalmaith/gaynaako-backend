import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { StatutUtilisateur } from '../../generated/prisma/enums';

export class UpdateUserStatutDto {
  @ApiProperty({ enum: StatutUtilisateur })
  @IsEnum(StatutUtilisateur)
  statut!: StatutUtilisateur;
}
