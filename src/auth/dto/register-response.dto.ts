import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({ example: 'OTP envoye a votre adresse email' })
  message!: string;
}

class UtilisateurResumeDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id!: string;

  @ApiProperty({ example: 'khalil@example.com' })
  email!: string;

  @ApiProperty({ example: 'ENTREPRENEUR' })
  role!: string;
}

export class VerifyOtpResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ type: UtilisateurResumeDto })
  utilisateur!: UtilisateurResumeDto;
}
