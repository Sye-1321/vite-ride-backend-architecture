import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { IDENTITY_PACKAGE_NAME } from '@app/proto-schema';

import { TenantsConfig } from '../config';
import { USER_DIRECTORY_PORT } from './application/user-directory.port';
import { IDENTITY_GRPC_CLIENT, IdentityGrpcAdapter } from './infrastructure/identity-grpc.adapter';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: IDENTITY_GRPC_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const config = configService.get<TenantsConfig>('tenants');
          if (!config) {
            throw new Error('Tenants configuration is unavailable');
          }
          return {
            transport: Transport.GRPC,
            options: {
              package: IDENTITY_PACKAGE_NAME,
              protoPath: join(process.cwd(), 'libs/proto-schema/proto/identity.proto'),
              url: config.IDENTITY_GRPC_URL,
            },
          };
        },
      },
    ]),
  ],
  providers: [
    IdentityGrpcAdapter,
    {
      provide: USER_DIRECTORY_PORT,
      useExisting: IdentityGrpcAdapter,
    },
  ],
  exports: [USER_DIRECTORY_PORT],
})
export class UsersModule {}
