import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class CreateCandidatureDto {
  @ApiProperty({
    description: "ID de l'opportunité (UUID de `opportunities_processed`).",
    example: 'a6ba42e1-4d91-450d-a8cf-262eb0327e38',
  })
  @IsString()
  @Length(1, 191)
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'opportuniteId doit être un UUID valide',
  })
  opportuniteId!: string;
}
