import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

import { ApplicationError } from '@app/application-core';

import { TenantMember } from '../../../../membership/domain/membership.entity';
import {
  TenantMemberDataModel,
  TenantMemberMapper,
} from '../../../../membership/infrastructure/persistence';
import { DriverRegistrationPort } from '../../../application/ports';
import { Driver } from '../../../domain/driver.entity';
import { DriverMapper } from './driver.mapper';
import { DriverDataModel } from './driver.schema';

@Injectable()
export class MongoDriverRegistrationAdapter implements DriverRegistrationPort {
  constructor(
    @InjectConnection('TenantsConnection')
    private readonly connection: Connection,
    @InjectModel(DriverDataModel.name, 'TenantsConnection')
    private readonly drivers: Model<DriverDataModel>,
    @InjectModel(TenantMemberDataModel.name, 'TenantsConnection')
    private readonly members: Model<TenantMemberDataModel>,
    private readonly driverMapper: DriverMapper,
    private readonly memberMapper: TenantMemberMapper,
  ) {}

  async register(driver: Driver, membership?: TenantMember): Promise<void> {
    driver.validate();
    membership?.validate();

    try {
      await this.connection.transaction(async (session) => {
        if (membership) {
          await this.members.create([this.memberMapper.toPersistence(membership)], { session });
        }
        await this.drivers.create([this.driverMapper.toPersistence(driver)], { session });
      });
    } catch (error) {
      if (this.isDuplicateKey(error)) {
        throw new ApplicationError('ALREADY_EXISTS', 'Driver already exists');
      }
      throw error;
    }
  }

  private isDuplicateKey(error: unknown): error is { code: number } {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
  }
}
