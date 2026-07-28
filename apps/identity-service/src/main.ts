import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { IdentityServiceModule } from './identity.module';
import { GrpcExceptionFilter } from '@app/common/filters/grpc-exception.filter';
import { IdentityErrorToGrpcStatus } from '@app/common';
import { IDENTITY_PACKAGE_NAME } from '@app/proto-schema';

import { identityConfigSchema } from './config';

async function bootstrap() {
  const config = identityConfigSchema.parse(process.env);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(IdentityServiceModule, {
    transport: Transport.GRPC,
    options: {
      package: IDENTITY_PACKAGE_NAME,
      protoPath: join(process.cwd(), 'libs/proto-schema/proto/identity.proto'),
      url: config.IDENTITY_GRPC_BIND_URL,
    },
  });

  app.useGlobalFilters(new GrpcExceptionFilter(IdentityErrorToGrpcStatus));

  await app.listen();
  Logger.log(`Identity gRPC service listening on ${config.IDENTITY_GRPC_BIND_URL}`, 'Bootstrap');
}

bootstrap();
