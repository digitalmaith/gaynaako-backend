import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { CycleFacturation, FournisseurPaiement } from '../../generated/prisma/enums';

export class SouscrireDto {
  @ApiProperty({ description: 'UUID du plan (voir GET /plans)' })
  @IsUUID()
  planId!: string;

  @ApiProperty({ enum: CycleFacturation })
  @IsEnum(CycleFacturation)
  cycle!: CycleFacturation;

  @ApiProperty({ enum: FournisseurPaiement })
  @IsEnum(FournisseurPaiement)
  fournisseur!: FournisseurPaiement;
}
