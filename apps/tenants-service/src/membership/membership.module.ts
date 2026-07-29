import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { TYPES } from '@app/shared-kernel';

import { TenantModule } from '../tenants/tenants.module';
import { MembershipCommandHandlers, MembershipQueryHandlers } from './application';
import { TenantMemberMapper, TenantMemberMongoRepository } from './infrastructure/persistence';
import {
  TenantMemberDataModel,
  TenantMemberSchema,
} from './infrastructure/persistence/mongo/tenant-member.schema';

@Module({
  imports: [
    CqrsModule,
    TenantModule,
    MongooseModule.forFeature(
      [{ name: TenantMemberDataModel.name, schema: TenantMemberSchema }],
      'TenantsConnection',
    ),
  ],
  providers: [
    ...MembershipCommandHandlers,
    ...MembershipQueryHandlers,
    TenantMemberMapper,
    {
      provide: TYPES.TenantMemberRepositoryPort,
      useClass: TenantMemberMongoRepository,
    },
  ],
  exports: [TYPES.TenantMemberRepositoryPort],
})
export class MembershipModule {}
