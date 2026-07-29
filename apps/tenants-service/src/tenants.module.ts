import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { MongoModule } from '@app/persistence';
import { TYPES } from '@app/shared-kernel';

import { TenantsApplicationService } from './application/tenants-application.service';
import tenantsConfig from './config/tenants.config';
import { DriverMapper, DriverMongoRepository } from './drivers/infrastructure/persistence';
import {
  DriverDataModel,
  DriverSchema,
} from './drivers/infrastructure/persistence/mongo/driver.schema';
import {
  TenantMemberMapper,
  TenantMemberMongoRepository,
} from './membership/infrastructure/persistence';
import {
  TenantMemberDataModel,
  TenantMemberSchema,
} from './membership/infrastructure/persistence/mongo/tenant-member.schema';
import { TenantMapper, TenantRepository } from './tenants/infrastructure/persistence';
import {
  TenantDataModel,
  TenantSchema,
} from './tenants/infrastructure/persistence/mongo/tenant.schema';
import { TenantsGrpcController } from './transports/tenants.grpc.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [tenantsConfig],
    }),
    MongoModule.forRoot('TENANTS', 'TenantsConnection'),
    MongooseModule.forFeature(
      [
        { name: TenantDataModel.name, schema: TenantSchema },
        { name: TenantMemberDataModel.name, schema: TenantMemberSchema },
        { name: DriverDataModel.name, schema: DriverSchema },
      ],
      'TenantsConnection',
    ),
  ],
  controllers: [TenantsGrpcController],
  providers: [
    TenantsApplicationService,
    TenantMapper,
    TenantMemberMapper,
    DriverMapper,
    {
      provide: TYPES.TenantRepositoryPort,
      useClass: TenantRepository,
    },
    {
      provide: TYPES.TenantMemberRepositoryPort,
      useClass: TenantMemberMongoRepository,
    },
    {
      provide: TYPES.DriverRepositoryPort,
      useClass: DriverMongoRepository,
    },
  ],
})
export class TenantsModule {}
