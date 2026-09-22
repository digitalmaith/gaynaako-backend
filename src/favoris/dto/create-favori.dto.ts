import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateFavoriDto {
  @ApiProperty({ description: "UUID de l'opportunité" })
  @IsUUID()
  opportuniteId!: string;
}
