import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { AppLoggerAdapter } from '@app/adapters';
import { AUTHORIZATION_PACKAGE_NAME } from '@app/proto-schema';

import { AuthorizationModule } from './authorization.module';
import { authorizationConfigSchema } from './config';

const logger = new AppLoggerAdapter('authorization-service');

async function bootstrap() {
  const config = authorizationConfigSchema.parse(process.env);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthorizationModule, {
    logger,
    transport: Transport.GRPC,
    options: {
      package: AUTHORIZATION_PACKAGE_NAME,
      protoPath: join(process.cwd(), 'libs/proto-schema/proto/authorization.proto'),
      url: config.AUTHORIZATION_GRPC_BIND_URL,
    },
  });

  await app.listen();
  logger.log('service started', { bindAddress: config.AUTHORIZATION_GRPC_BIND_URL }, 'Bootstrap');
}

void bootstrap().catch((error: unknown) => {
  logger.fatal('service startup failed', error, 'Bootstrap');
  process.exitCode = 1;
});
