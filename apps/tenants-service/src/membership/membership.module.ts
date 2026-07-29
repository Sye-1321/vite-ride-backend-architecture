import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { TYPES } from '@app/shared-kernel';

import { AuthorizationSyncModule } from '../authorization-sync/authorization-sync.module';
import { TenantModule } from '../tenants/tenants.module';
import { UsersModule } from '../users/users.module';
import {
  MEMBERSHIP_MUTATION_PORT,
  MembershipCommandHandlers,
  MembershipQueryHandlers,
} from './application';
import {
  MongoMembershipMutationAdapter,
  TenantMemberMapper,
  TenantMemberMongoRepository,
} from './infrastructure/persistence';
import {
  TenantMemberDataModel,
  TenantMemberSchema,
} from './infrastructure/persistence/mongo/tenant-member.schema';

@Module({
  imports: [
    CqrsModule,
    AuthorizationSyncModule,
    TenantModule,
    UsersModule,
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
      provide: MEMBERSHIP_MUTATION_PORT,
      useClass: MongoMembershipMutationAdapter,
    },
    {
      provide: TYPES.TenantMemberRepositoryPort,
      useClass: TenantMemberMongoRepository,
    },
  ],
  exports: [TYPES.TenantMemberRepositoryPort, TenantMemberMapper, MongooseModule],
})
export class MembershipModule {}
