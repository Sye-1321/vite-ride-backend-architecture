import { Injectable } from '@nestjs/common';
import { None, Option, Some } from 'oxide.ts';

import { DriverRepositoryPort } from '../../drivers/application/ports';
import { Driver } from '../../drivers/domain/driver.entity';
import { InMemoryRepositoryBase } from './in-memory.repository.base';

@Injectable()
export class DriverInMemoryRepository
  extends InMemoryRepositoryBase<Driver>
  implements DriverRepositoryPort
{
  async findByUserIdAndTenantId(userId: string, tenantId: string): Promise<Option<Driver>> {
    const driver = [...this.records.values()].find(
      (candidate) => candidate.userId === userId && candidate.tenantId === tenantId,
    );
    return driver ? Some(driver) : None;
  }

  async findByDriverIdAndTenantId(driverId: string, tenantId: string): Promise<Option<Driver>> {
    const driver = this.records.get(driverId);
    return driver?.tenantId === tenantId ? Some(driver) : None;
  }
}
