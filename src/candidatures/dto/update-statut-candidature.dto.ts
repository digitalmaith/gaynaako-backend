import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { StatutCandidature } from '../../generated/prisma/enums';

export class UpdateStatutCandidatureDto {
  @ApiProperty({ enum: StatutCandidature })
  @IsEnum(StatutCandidature)
  statut!: StatutCandidature;
}
