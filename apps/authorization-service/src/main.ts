import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { AUTHORIZATION_PACKAGE_NAME } from '@app/proto-schema';

import { AuthorizationModule } from './authorization.module';
import { authorizationConfigSchema } from './config';

async function bootstrap() {
  const config = authorizationConfigSchema.parse(process.env);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthorizationModule, {
    transport: Transport.GRPC,
    options: {
      package: AUTHORIZATION_PACKAGE_NAME,
      protoPath: join(process.cwd(), 'libs/proto-schema/proto/authorization.proto'),
      url: config.AUTHORIZATION_GRPC_BIND_URL,
    },
  });

  await app.listen();
  Logger.log(
    `Authorization gRPC service listening on ${config.AUTHORIZATION_GRPC_BIND_URL}`,
    'Bootstrap',
  );
}

bootstrap();
