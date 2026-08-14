import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import multipart from '@fastify/multipart';
import { AppModule } from './app.module';

export async function createApp(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.register(multipart, {
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  setupSwagger(app);

  return app;
}

function setupSwagger(app: NestFastifyApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Gaynaako Opportunity Agent API')
    .setDescription("API de la plateforme de centralisation d'opportunités assistée par IA")
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentification & gestion des comptes')
    .addTag('users', 'Profils utilisateurs')
    .addTag('opportunities', 'Opportunités')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
