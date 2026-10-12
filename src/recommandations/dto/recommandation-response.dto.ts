import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OpportuniteScrapeeDto {
  @ApiProperty({ example: '4b0d449f4af8', description: "ID de l'opportunité scrapée" })
  id!: string;

  @ApiProperty({ example: 'P-TD-AA0-024' })
  titre!: string;

  @ApiPropertyOptional({ description: 'Description complète' })
  description?: string | null;

  @ApiPropertyOptional({ example: 'autre' })
  type?: string | null;

  @ApiPropertyOptional({ example: 'Afrique' })
  pays?: string | null;

  @ApiProperty({ example: ['agriculture', 'eau'], type: [String] })
  secteurs!: string[];

  @ApiPropertyOptional({ example: 'Banque Mondiale' })
  organisation?: string | null;

  @ApiPropertyOptional({ example: 'https://exemple.com/opp' })
  url?: string | null;

  @ApiPropertyOptional({ example: '2026-12-31', nullable: true })
  deadline?: Date | null;

  @ApiPropertyOptional({ example: 85 })
  qualityScore?: number | null;
}

export class RecommandationResponseDto {
  @ApiProperty({ example: 'a5b01db4-6eff-48d2-8f20-752b8c968e41' })
  id!: string;

  @ApiProperty({ example: 0.73, description: 'Score de 0 à 1' })
  scorePertinence!: number;

  @ApiProperty({ example: 73, description: 'Score en pourcentage' })
  scorePourcentage!: number;

  @ApiProperty({ example: 'ALGORITHMIQUE' })
  methodeMatching!: string;

  @ApiProperty({ example: '2026-10-12T15:30:00.000Z' })
  dateGeneration!: Date;

  @ApiProperty({ type: OpportuniteScrapeeDto })
  opportunite!: OpportuniteScrapeeDto;
}

export class ListeRecommandationsResponseDto {
  @ApiProperty({ type: [RecommandationResponseDto] })
  items!: RecommandationResponseDto[];

  @ApiProperty({
    example: { total: 5, page: 1, limit: 10, totalPages: 1 },
  })
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
