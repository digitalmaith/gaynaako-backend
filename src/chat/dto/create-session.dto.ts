import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSessionDto {
  @ApiPropertyOptional({
    description: 'Titre de la session',
    example: 'Recherche financement',
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  title?: string;
}
