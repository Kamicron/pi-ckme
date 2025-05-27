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
  const port = process.env.PORT || 5001;
  await app.listen(port);
  
  // Affichage des informations du serveur
  const server = app.getHttpServer();
  const { address, port: serverPort } = server.address();
  console.log(`\n\x1b[32m✓ Serveur démarré avec succès !\x1b[0m`);
  console.log(`\x1b[36m➜ Serveur accessible à l'adresse: \x1b[33mhttp://${address === '::' ? 'localhost' : address}:${serverPort}\x1b[0m\n`);
}
bootstrap();
