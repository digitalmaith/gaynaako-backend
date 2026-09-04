// src/auth/auth.controller.ts
import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CheckEmailDto } from './dto/check-email.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { FastifyRequest } from 'fastify';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('check-email')
  async checkEmailAvailability(@Query() dto: CheckEmailDto) {
    return this.authService.checkEmailAvailability(dto.email);
  }

  @Post('register')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        nom: { type: 'string' },
        prenom: { type: 'string' },
        role: { type: 'string', enum: ['ENTREPRENEUR', 'PME', 'ONG'] },
        secteurId: { type: 'string', description: 'Entrepreneur' },
        paysId: { type: 'string', description: 'Entrepreneur' },
        domaineExpertise: { type: 'string', description: 'Entrepreneur' },
        objectifs: { type: 'string', description: 'Entrepreneur (optionnel)' },
        nomEntreprise: { type: 'string', description: 'PME' },
        secteurIds: { type: 'string', description: 'PME — UUIDs séparés par virgules' },
        nomOrganisation: { type: 'string', description: 'ONG' },
        domaineInterventionIds: { type: 'string', description: 'ONG — UUIDs séparés par virgules' },
        mission: { type: 'string', description: 'ONG (optionnel)' },
        logo: { type: 'string', format: 'binary', description: 'PME / ONG' },
      },
      required: ['email', 'password', 'nom', 'prenom', 'role'],
    },
  })
  async register(@Req() req: FastifyRequest) {
    const parts = req.parts();
    const fields: Record<string, string> = {};
    let logoFile: { buffer: Buffer; filename: string } | undefined;

    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'logo') {
        logoFile = { buffer: await part.toBuffer(), filename: part.filename };
      } else if (part.type === 'field') {
        fields[part.fieldname] = part.value as string;
      }
    }

    const dto = fields as unknown as RegisterDto;
    return this.authService.register(dto, logoFile);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.code);
  }

  @Post('resend-otp')
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto.email);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
  }
}
