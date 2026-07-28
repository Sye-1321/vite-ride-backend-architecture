import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GatewayExceptionFilter } from '@app/common';

import { gatewayConfigSchema } from './config';

async function bootstrap() {
  const config = gatewayConfigSchema.parse(process.env);
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(config.GATEWAY_PREFIX);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GatewayExceptionFilter());

  await app.listen(config.GATEWAY_PORT);
  Logger.log(`API Gateway listening on port ${config.GATEWAY_PORT}`, 'Bootstrap');
}

bootstrap();
