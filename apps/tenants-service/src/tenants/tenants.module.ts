import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { TYPES } from '@app/shared-kernel';

import { TenantCommandHandlers, TenantQueryHandlers } from './application';
import { TenantMapper, TenantRepository } from './infrastructure/persistence';
import { TenantDataModel, TenantSchema } from './infrastructure/persistence/mongo/tenant.schema';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature(
      [{ name: TenantDataModel.name, schema: TenantSchema }],
      'TenantsConnection',
    ),
  ],
  providers: [
    ...TenantCommandHandlers,
    ...TenantQueryHandlers,
    TenantMapper,
    {
      provide: TYPES.TenantRepositoryPort,
      useClass: TenantRepository,
    },
  ],
  exports: [TYPES.TenantRepositoryPort, TenantMapper, MongooseModule],
})
export class TenantModule {}
