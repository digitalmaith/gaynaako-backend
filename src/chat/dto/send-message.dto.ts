import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'Message envoyé au chatbot',
    example: 'Quelles opportunités au Sénégal ?',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message!: string;

  @ApiPropertyOptional({
    description: 'ID de la session existante (optionnel)',
  })
  @IsOptional()
  @IsString()
  session_id?: string;
}
