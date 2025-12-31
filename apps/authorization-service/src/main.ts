import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AuthorizationModule } from './authorization.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthorizationModule);

  app.setGlobalPrefix('authorization');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  await app.listen(3005);
}

bootstrap();
