import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { AppLoggerAdapter } from '@app/adapters';
import { TENANTS_PACKAGE_NAME } from '@app/proto-schema';

import { tenantsConfigSchema } from './config';
import { TenantsModule } from './tenants.module';

const logger = new AppLoggerAdapter('tenants-service');

async function bootstrap() {
  const config = tenantsConfigSchema.parse(process.env);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(TenantsModule, {
    logger,
    transport: Transport.GRPC,
    options: {
      package: TENANTS_PACKAGE_NAME,
      protoPath: join(process.cwd(), 'libs/proto-schema/proto/tenants.proto'),
      url: config.TENANTS_GRPC_BIND_URL,
    },
  });

  await app.listen();
  logger.log('service started', { bindAddress: config.TENANTS_GRPC_BIND_URL }, 'Bootstrap');
}

void bootstrap().catch((error: unknown) => {
  logger.fatal('service startup failed', error, 'Bootstrap');
  process.exitCode = 1;
});
