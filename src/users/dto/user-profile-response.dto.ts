import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DocumentResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() type!: string;
  @ApiProperty() libelle!: string;
  @ApiProperty() nomFichier!: string;
  @ApiProperty() mimeType!: string;
  @ApiProperty() tailleOctets!: number;
  @ApiPropertyOptional() dateExpiration?: Date | null;
  @ApiProperty() dateAjout!: Date;
  @ApiPropertyOptional() url?: string | null;
}

export class AbonnementResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() statut!: string;
  @ApiProperty() cycle!: string;
  @ApiPropertyOptional() dateDebut?: Date | null;
  @ApiPropertyOptional() dateFin?: Date | null;
  @ApiProperty() renouvellementAuto!: boolean;
  @ApiProperty()
  plan!: {
    id: string;
    nom: string;
    description: string | null;
    prixMensuel: number;
    prixAnnuel: number;
  };
}

export class StatistiquesResponseDto {
  @ApiProperty({ example: 3 }) candidatures!: number;
  @ApiProperty({ example: 5 }) favoris!: number;
  @ApiProperty({ example: 8 }) recommandations!: number;
  @ApiProperty({ example: 2 }) documents!: number;
  @ApiPropertyOptional({ example: 12 }) opportunitesGerees?: number;
  @ApiPropertyOptional({ example: 45 }) utilisateursGeres?: number;
}

export class UserProfileResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() nom!: string;
  @ApiProperty() prenom!: string;
  @ApiProperty() role!: string;
  @ApiProperty() statut!: string;
  @ApiProperty() dateCreation!: Date;
  @ApiPropertyOptional() avatarUrl?: string | null;
  @ApiPropertyOptional() telephone?: string | null;

  @ApiPropertyOptional() entrepreneur?: Record<string, unknown> | null;
  @ApiPropertyOptional() pme?: Record<string, unknown> | null;
  @ApiPropertyOptional() ong?: Record<string, unknown> | null;
  @ApiPropertyOptional() administrateur?: Record<string, unknown> | null;

  @ApiProperty({ type: [DocumentResponseDto] })
  documents!: DocumentResponseDto[];

  @ApiPropertyOptional({ type: AbonnementResponseDto })
  abonnement?: AbonnementResponseDto | null;

  @ApiProperty({ type: StatistiquesResponseDto })
  statistiques!: StatistiquesResponseDto;
}
