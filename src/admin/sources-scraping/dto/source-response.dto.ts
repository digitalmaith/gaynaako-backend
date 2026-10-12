import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SourceScrapingResponseDto {
  @ApiProperty({ example: 'a6ba42e1-4d91-450d-a8cf-262eb0327e38' })
  id!: string;

  @ApiProperty({ example: 'DER Sénégal' })
  nom!: string;

  @ApiProperty({ example: 'https://der.sn/' })
  url!: string;

  @ApiProperty({ example: 'html', enum: ['html', 'puppeteer', 'api'] })
  type!: string;

  @ApiProperty({ example: true })
  actif!: boolean;

  @ApiPropertyOptional({ example: { container: 'article' } })
  selectors?: Record<string, any> | null;

  @ApiPropertyOptional({ example: { max_pages: 5 } })
  pagination?: Record<string, any> | null;

  @ApiProperty({ example: 3000 })
  rateLimitMs!: number;

  @ApiPropertyOptional()
  apiConfig?: Record<string, any> | null;

  @ApiPropertyOptional({ example: '2026-10-12T21:04:38.000Z' })
  dernierScan?: Date | null;

  @ApiPropertyOptional({ example: 'success' })
  dernierStatut?: string | null;

  @ApiPropertyOptional({ example: null })
  dernierMessage?: string | null;

  @ApiProperty({ example: 323 })
  nbOpportunites!: number;

  @ApiProperty()
  dateCreation!: Date;

  @ApiProperty()
  dateMaj!: Date;
}
