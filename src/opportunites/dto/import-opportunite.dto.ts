import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateOpportuniteDto } from './create-opportunite.dto';

export class ImportOpportuniteDto extends CreateOpportuniteDto {
  @ApiProperty({ description: 'Identifiant unique côté service IA, pour éviter les doublons' })
  @IsString()
  externalId!: string;
}
