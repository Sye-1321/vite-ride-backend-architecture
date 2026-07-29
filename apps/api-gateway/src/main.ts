import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from './app.module';

import { AppLoggerAdapter } from '@app/adapters';
import { jwtSchema } from '@app/auth/jwt/config';
import { GatewayExceptionFilter } from '@app/common';
import { RedisClientPort } from '@app/redis';
import { JwtRedisSocketAdapter } from '@app/realtime';
import { TYPES } from '@app/shared-kernel';

import { gatewayConfigSchema } from './config';

const logger = new AppLoggerAdapter('api-gateway');

async function bootstrap() {
  const config = gatewayConfigSchema.parse(process.env);
  const jwtConfig = jwtSchema.parse(process.env);
  const app = await NestFactory.create(AppModule, { logger });
  const realtimeAdapter = await JwtRedisSocketAdapter.create({
    app,
    jwtService: app.get(JwtService),
    jwtSecret: jwtConfig.JWT_ACCESS_TOKEN_SECRET,
    redis: app.get<RedisClientPort>(TYPES.RedisClientPort),
    logger,
    allowedOrigins: config.GATEWAY_ALLOWED_ORIGINS,
  });

  app.setGlobalPrefix(config.GATEWAY_PREFIX);
  app.useWebSocketAdapter(realtimeAdapter);
  app.enableShutdownHooks();

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
