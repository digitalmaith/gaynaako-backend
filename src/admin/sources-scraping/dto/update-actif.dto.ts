import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateActifDto {
  @ApiProperty({ example: true, description: 'Nouveau statut actif/inactif' })
  @IsBoolean()
  actif!: boolean;
}
