import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SetPlanFonctionnaliteDto {
  @ApiProperty({ description: 'ex: "max_candidatures_par_mois", "acces_chatbot"' })
  @IsString()
  @MinLength(2)
  cle!: string;

  @ApiProperty({ description: 'ex: "illimite", "10", "true"' })
  @IsString()
  valeur!: string;
}
