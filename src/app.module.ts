import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { ReferenceModule } from './reference/reference.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CloudinaryModule,
    ReferenceModule,
  ],
})
export class AppModule {}
