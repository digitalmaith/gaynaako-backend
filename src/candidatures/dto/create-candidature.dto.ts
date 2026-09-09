import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateCandidatureDto {
  @ApiProperty({ description: "UUID de l'opportunité" })
  @IsUUID()
  opportuniteId!: string;
}
