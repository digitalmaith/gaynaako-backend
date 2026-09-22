import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  nom!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Prix mensuel en FCFA' })
  @IsInt()
  @Min(0)
  prixMensuel!: number;

  @ApiProperty({ description: 'Prix annuel en FCFA' })
  @IsInt()
  @Min(0)
  prixAnnuel!: number;
}
