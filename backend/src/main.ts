import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuration CORS
  const frontUrl = process.env.FRONT_URL?.replace(/\/$/, '') || 'http://localhost:3001';
  console.log('FRONT_URL:', frontUrl);

  app.enableCors({
    origin: frontUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });

  // Activation de la validation
  app.useGlobalPipes(new ValidationPipe());

  // Configuration du port
  await app.listen(process.env.PORT || 5001);
}
bootstrap();
