import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';

import { AUTHORIZATION_PACKAGE_NAME } from '@app/proto-schema';

import { TenantsConfig } from '../config';
import {
  AUTHORIZATION_GRPC_CLIENT,
  AuthorizationRoleGrpcAdapter,
} from './infrastructure/authorization-role.grpc.adapter';
import { RoleAssignmentOutboxDispatcher } from './infrastructure/role-assignment-outbox.dispatcher';
import {
  RoleAssignmentOutboxDataModel,
  RoleAssignmentOutboxSchema,
} from './infrastructure/role-assignment-outbox.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: RoleAssignmentOutboxDataModel.name,
          schema: RoleAssignmentOutboxSchema,
        },
      ],
      'TenantsConnection',
    ),
    ClientsModule.registerAsync([
      {
        name: AUTHORIZATION_GRPC_CLIENT,
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
              package: AUTHORIZATION_PACKAGE_NAME,
              protoPath: join(process.cwd(), 'libs/proto-schema/proto/authorization.proto'),
              url: config.AUTHORIZATION_GRPC_URL,
            },
          };
        },
      },
    ]),
  ],
  providers: [AuthorizationRoleGrpcAdapter, RoleAssignmentOutboxDispatcher],
  exports: [MongooseModule],
})
export class AuthorizationSyncModule {}
