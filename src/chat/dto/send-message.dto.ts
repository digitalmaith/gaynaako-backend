import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

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

  /**
   * Contexte libre envoyé au chatbot.
   *
   * Exemples :
   *   - { candidature_id: '...', opportunite_id: '...' }   → page candidature
   *   - { recommandation_id: '...' }                        → page recommandation
   *   - { opportunite_id: '...' }                           → page opportunité
   *   - { page: 'profil' }                                  → page profil
   *
   * Le backend Python (chatbot.js) détecte les clés connues
   * (candidature_id, opportunite_id) et enrichit automatiquement le prompt.
   */
  @ApiPropertyOptional({
    description:
      'Contexte arbitraire pour enrichir la réponse du chatbot (candidature, opportunité, etc.)',
    example: {
      candidature_id: 'f767fe68-1fdd-48c3-a273-b28b9d086e55',
      opportunite_id: 'd063bf1f-c672-11f1-999a-00155dba13ac',
    },
  })
  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}
