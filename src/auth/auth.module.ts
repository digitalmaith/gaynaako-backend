import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';
import { MailModule } from '../common/mail/mail.module';
import { OtpService } from './otp.service';
import { UserRepository } from './repositories/user.repository';
import { PendingRegistrationRepository } from './repositories/pending-registration.repository';
import { OtpRepository } from './repositories/otp.repository';

@Module({
  imports: [
    CloudinaryModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '1d') as unknown as number,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    UserRepository,
    PendingRegistrationRepository,
    OtpRepository,
  ],
  exports: [AuthService, UserRepository],
})
export class AuthModule {}
