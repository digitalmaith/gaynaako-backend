import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum RegisterRole {
  ENTREPRENEUR = 'ENTREPRENEUR',
  PME = 'PME',
  ONG = 'ONG',
}

export class RegisterDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() @MinLength(8) password!: string;
  @ApiProperty({ enum: RegisterRole }) @IsEnum(RegisterRole) role!: RegisterRole;

  // --- Entrepreneur ---
  @ApiPropertyOptional() @IsOptional() @IsString() secteurId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() paysId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() domaineExpertise?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() objectifs?: string;

  // --- PME ---
  @ApiPropertyOptional() @IsOptional() @IsString() nomEntreprise?: string;
  @ApiPropertyOptional({ description: 'UUIDs séparés par des virgules' })
  @IsOptional() @IsString() secteurIds?: string;

  // --- ONG ---
  @ApiPropertyOptional() @IsOptional() @IsString() nomOrganisation?: string;
  @ApiPropertyOptional({ description: 'UUIDs séparés par des virgules' })
  @IsOptional() @IsString() domaineInterventionIds?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mission?: string;
}
