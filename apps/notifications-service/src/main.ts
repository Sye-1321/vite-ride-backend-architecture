import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { AppLoggerAdapter } from '@app/adapters';
import { GrpcExceptionFilter } from '@app/common';
import { NOTIFICATIONS_PACKAGE_NAME } from '@app/proto-schema';

import { notificationsConfigSchema } from './config';
import { NotificationsModule } from './notifications.module';

const logger = new AppLoggerAdapter('notifications-service');

async function bootstrap() {
  const config = notificationsConfigSchema.parse(process.env);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(NotificationsModule, {
    logger,
    transport: Transport.GRPC,
    options: {
      package: NOTIFICATIONS_PACKAGE_NAME,
      protoPath: join(process.cwd(), 'libs/proto-schema/proto/notifications.proto'),
      url: config.NOTIFICATIONS_GRPC_BIND_URL,
    },
  });

  app.useGlobalFilters(new GrpcExceptionFilter());
  app.enableShutdownHooks();
  await app.listen();
  logger.log('service started', { bindAddress: config.NOTIFICATIONS_GRPC_BIND_URL }, 'Bootstrap');
}

void bootstrap().catch((error: unknown) => {
  logger.fatal('service startup failed', error, 'Bootstrap');
  process.exitCode = 1;
});
