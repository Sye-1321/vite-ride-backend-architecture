import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { MongoModule } from '@app/persistence';
import { TYPES } from '@app/shared-kernel';

import { TenantsApplicationService } from './application/tenants-application.service';
import { tenantsConfigSchema } from './config';
import tenantsConfig from './config/tenants.config';
import {
  DriverInMemoryRepository,
  TenantInMemoryRepository,
  TenantMemberInMemoryRepository,
} from './infrastructure/in-memory';
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

const startupConfig = tenantsConfigSchema.parse(process.env);
const useMongo = startupConfig.TENANTS_STORE_DRIVER === 'mongodb';
const persistenceImports = useMongo
  ? [
      MongoModule.forRoot('TENANTS', 'TenantsConnection'),
      MongooseModule.forFeature(
        [
          { name: TenantDataModel.name, schema: TenantSchema },
          { name: TenantMemberDataModel.name, schema: TenantMemberSchema },
          { name: DriverDataModel.name, schema: DriverSchema },
        ],
        'TenantsConnection',
      ),
    ]
  : [];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [tenantsConfig],
    }),
    ...persistenceImports,
  ],
  controllers: [TenantsGrpcController],
  providers: [
    TenantsApplicationService,
    ...(useMongo ? [TenantMapper, TenantMemberMapper, DriverMapper] : []),
    {
      provide: TYPES.TenantRepositoryPort,
      useClass: useMongo ? TenantRepository : TenantInMemoryRepository,
    },
    {
      provide: TYPES.TenantMemberRepositoryPort,
      useClass: useMongo ? TenantMemberMongoRepository : TenantMemberInMemoryRepository,
    },
    {
      provide: TYPES.DriverRepositoryPort,
      useClass: useMongo ? DriverMongoRepository : DriverInMemoryRepository,
    },
  ],
})
export class TenantsModule {}
