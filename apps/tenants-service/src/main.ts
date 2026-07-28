import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { TENANTS_PACKAGE_NAME } from '@app/proto-schema';

import { tenantsConfigSchema } from './config';
import { TenantsModule } from './tenants.module';

async function bootstrap() {
  const config = tenantsConfigSchema.parse(process.env);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(TenantsModule, {
    transport: Transport.GRPC,
    options: {
      package: TENANTS_PACKAGE_NAME,
      protoPath: join(process.cwd(), 'libs/proto-schema/proto/tenants.proto'),
      url: config.TENANTS_GRPC_BIND_URL,
    },
  });

  await app.listen();
  Logger.log(`Tenants gRPC service listening on ${config.TENANTS_GRPC_BIND_URL}`, 'Bootstrap');
}

bootstrap();
