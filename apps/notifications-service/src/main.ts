import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { NOTIFICATIONS_PACKAGE_NAME } from '@app/proto-schema';

import { notificationsConfigSchema } from './config';
import { NotificationsModule } from './notifications.module';

async function bootstrap() {
  const config = notificationsConfigSchema.parse(process.env);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(NotificationsModule, {
    transport: Transport.GRPC,
    options: {
      package: NOTIFICATIONS_PACKAGE_NAME,
      protoPath: join(process.cwd(), 'libs/proto-schema/proto/notifications.proto'),
      url: config.NOTIFICATIONS_GRPC_BIND_URL,
    },
  });

  await app.listen();
  Logger.log(
    `Notifications gRPC service listening on ${config.NOTIFICATIONS_GRPC_BIND_URL}`,
    'Bootstrap',
  );
}

bootstrap();
