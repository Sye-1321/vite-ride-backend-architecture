import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { IdentityServiceModule } from './identity.module';
import { GrpcExceptionFilter } from '@app/common/filters/grpc-exception.filter';
import { IdentityErrorToGrpcStatus } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(IdentityServiceModule, {
    transport: Transport.GRPC,
    options: {
      package: 'identity',
      protoPath: join(process.cwd(), 'libs/proto-schema/proto/identity.proto'),
      url: '0.0.0.0:50051',
    },
  });

  app.useGlobalFilters(new GrpcExceptionFilter(IdentityErrorToGrpcStatus));
  console.log('identity service successfully started');

  await app.listen();
}

bootstrap();
