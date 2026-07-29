import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

import { ApplicationError } from '@app/application-core';

import {
  TenantMemberDataModel,
  TenantMemberMapper,
} from '../../membership/infrastructure/persistence';
import { TenantDataModel, TenantMapper } from '../../tenants/infrastructure/persistence';
import { TenantProvisioningPort } from '../application/ports';
import { TenantMember } from '../../membership/domain/membership.entity';
import { Tenant } from '../../tenants/domain/tenant.entity';

@Injectable()
export class MongoTenantProvisioningAdapter implements TenantProvisioningPort {
  constructor(
    @InjectConnection('TenantsConnection')
    private readonly connection: Connection,
    @InjectModel(TenantDataModel.name, 'TenantsConnection')
    private readonly tenants: Model<TenantDataModel>,
    @InjectModel(TenantMemberDataModel.name, 'TenantsConnection')
    private readonly members: Model<TenantMemberDataModel>,
    private readonly tenantMapper: TenantMapper,
    private readonly memberMapper: TenantMemberMapper,
  ) {}

  async provision(tenant: Tenant, owner: TenantMember): Promise<void> {
    tenant.validate();
    owner.validate();

    try {
      await this.connection.transaction(async (session) => {
        await this.tenants.create([this.tenantMapper.toPersistence(tenant)], { session });
        await this.members.create([this.memberMapper.toPersistence(owner)], { session });
      });
    } catch (error) {
      if (this.isDuplicateKey(error)) {
        throw new ApplicationError('ALREADY_EXISTS', 'Tenant name already exists');
      }
      throw error;
    }
  }

  private isDuplicateKey(error: unknown): error is { code: number } {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
  }
}
