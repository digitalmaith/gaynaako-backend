import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class EntrepreneurProfileDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  secteurActivite!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  pays!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  domaineExpertise!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  objectifs?: string;
}
