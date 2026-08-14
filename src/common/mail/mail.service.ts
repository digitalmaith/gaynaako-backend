import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.getOrThrow<string>('SMTP_HOST'),
      port: Number(this.config.get<string>('SMTP_PORT', '587')),
      secure: false,
      requireTLS: true,
      auth: {
        user: this.config.getOrThrow<string>('SMTP_USER'),
        pass: this.config.getOrThrow<string>('SMTP_PASS'),
      },
    });
  }

  private async send(
    to: string,
    subject: string,
    code: string,
    message: string,
    firstName?: string,
  ): Promise<void> {
    const greeting = firstName ? `Bonjour ${firstName},` : 'Bonjour,';

    const text = `${greeting}

${message}

Code : ${code}

Ce code expire dans 10 minutes.

Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.`;

    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>${greeting}</h2>
        <p>${message}</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">
          ${code}
        </p>
        <p>Ce code expire dans 10 minutes.</p>
        <p>
          Si vous n'êtes pas à l'origine de cette demande,
          ignorez cet email.
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.config.getOrThrow<string>('SMTP_FROM'),
        replyTo: this.config.getOrThrow<string>('SMTP_USER'),
        to,
        subject,
        text,
        html,
      });

      this.logger.log(`Email envoyé avec succès à ${to}`);
    } catch (err: unknown) {
      this.logger.error(`Échec envoi email à ${to}`, err);
      throw err;
    }
  }

  async sendOtpEmail(
    to: string,
    code: string,
    firstName?: string,
  ): Promise<void> {
    await this.send(
      to,
      'Vérification de votre compte Gaynaako Opportunity Agent',
      code,
      'Voici votre code de vérification :',
      firstName,
    );
  }

  async sendPasswordResetEmail(
    to: string,
    code: string,
    firstName?: string,
  ): Promise<void> {
    await this.send(
      to,
      'Réinitialisation de votre mot de passe',
      code,
      'Voici votre code de réinitialisation de mot de passe :',
      firstName,
    );
  }
}
