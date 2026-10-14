import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateIdentityDto {
  @ApiPropertyOptional({ example: 'Thiam' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nom?: string;

  @ApiPropertyOptional({ example: 'Cheikh Ibrahima' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  prenom?: string;

  @ApiPropertyOptional({ example: '+221771234567' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telephone?: string;
}
