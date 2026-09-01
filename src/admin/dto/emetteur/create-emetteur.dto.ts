import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUrl, MinLength } from 'class-validator';
import { TypeEmetteur } from '../../../generated/prisma/enums';

export class CreateEmetteurDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  nom!: string;

  @ApiProperty()
  @IsUrl()
  url!: string;

  @ApiProperty({ enum: TypeEmetteur })
  @IsEnum(TypeEmetteur)
  type!: TypeEmetteur;

  @ApiProperty({ description: 'Fréquence de collecte, ex: "quotidienne", "hebdomadaire"' })
  @IsString()
  frequenceCollecte!: string;
}
