import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { AppLoggerAdapter } from '@app/adapters';
import { GatewayExceptionFilter } from '@app/common';

import { gatewayConfigSchema } from './config';

const logger = new AppLoggerAdapter('api-gateway');

async function bootstrap() {
  const config = gatewayConfigSchema.parse(process.env);
  const app = await NestFactory.create(AppModule, { logger });

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
  logger.log('service started', { port: config.GATEWAY_PORT }, 'Bootstrap');
}

void bootstrap().catch((error: unknown) => {
  logger.fatal('service startup failed', error, 'Bootstrap');
  process.exitCode = 1;
});
