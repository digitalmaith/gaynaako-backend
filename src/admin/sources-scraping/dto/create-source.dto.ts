import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';
import { TypeSourceScraping } from '../../../generated/prisma/enums';

export class CreateSourceDto {
  @ApiProperty({ example: 'DER Sénégal', description: 'Nom de la source' })
  @IsString()
  @MinLength(3)
  nom!: string;

  @ApiProperty({ example: 'https://der.sn/', description: 'URL à scraper' })
  @IsUrl({ require_tld: false })
  url!: string;

  @ApiProperty({
    enum: TypeSourceScraping,
    example: TypeSourceScraping.html,
    description: 'Type de source',
  })
  @IsEnum(TypeSourceScraping)
  type!: TypeSourceScraping;

  @ApiPropertyOptional({ default: true, description: 'Source active ou non' })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;

  @ApiPropertyOptional({
    description: 'Sélecteurs CSS (obligatoire pour html/puppeteer)',
    example: {
      container: 'article, .post',
      title: 'h2, h3',
      description: 'p',
      link: 'a',
      date: '.date',
    },
  })
  @IsOptional()
  @IsObject()
  selectors?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Configuration de pagination',
    example: { max_pages: 5, next_selector: 'a.next' },
  })
  @IsOptional()
  @IsObject()
  pagination?: Record<string, string | number>;

  @ApiPropertyOptional({
    example: 3000,
    description: 'Délai minimum entre chaque page (ms)',
  })
  @IsOptional()
  @IsInt()
  @Min(500)
  rateLimitMs?: number;

  @ApiPropertyOptional({ description: 'Config spécifique aux sources API' })
  @IsOptional()
  @IsObject()
  apiConfig?: Record<string, any>;
}
