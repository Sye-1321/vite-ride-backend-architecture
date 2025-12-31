import { Option } from 'oxide.ts';
import { RepositoryPort } from '@app/shared-kernel';
import { Driver } from '../../domain/driver.entity';

export interface DriverRepositoryPort
  extends RepositoryPort<Driver> {

  findByUserIdAndTenantId(
    userId: string,
    tenantId: string,
  ): Promise<Option<Driver>>;

  findByDriverIdAndTenantId(
    driverId: string,
    tenantId: string,
  ): Promise<Option<Driver>>;
}
