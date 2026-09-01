import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { StatutEmetteur } from '../../../generated/prisma/enums';

export class UpdateEmetteurStatutDto {
  @ApiProperty({ enum: StatutEmetteur })
  @IsEnum(StatutEmetteur)
  statut!: StatutEmetteur;
}
