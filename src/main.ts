require('dotenv').config();
import { NestFactory } from '@nestjs/core';
import { logger } from 'skyot';
import { AppModule } from './app.module';
import { MongoDBConect } from './database/config/mongoConnect';

export const API = 'http://localhost:3000';

async function bootstrap() {
  process.env.TZ = 'America/Sao_Paulo';
  await MongoDBConect.startMongo();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.listen(process.env.PORT, () => {
    logger(`Servidor rodando na porta: ${process.env.PORT}`);
  });
}
bootstrap();
