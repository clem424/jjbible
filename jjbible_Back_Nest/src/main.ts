import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Équivalent de app.use(cors()) dans l'ancien Express
  app.enableCors();

  // Toutes les routes sont préfixées par /api (comme l'ancienne API).
  // On exclut '/' pour garder un health-check à la racine.
  app.setGlobalPrefix('api', { exclude: ['/'] });

  // Validation automatique des DTO (class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // --- Documentation Swagger ---
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API JJBible')
    .setDescription(
      'API de gestion du "pokédex" de techniques de Jiu-Jitsu Brésilien. ' +
        'Authentification par JWT (bouton « Authorize »).',
    )
    .setVersion('4.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  // Disponible sur http://localhost:3000/docs
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`✓ API JJBible démarrée sur le port ${port}`);
  console.log(`✓ Swagger : http://localhost:${port}/docs`);
}

bootstrap();
