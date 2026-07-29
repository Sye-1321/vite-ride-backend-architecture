import { TenantMember } from '../../../membership/domain/membership.entity';
import { Driver } from '../../domain/driver.entity';

export const DRIVER_REGISTRATION_PORT = Symbol('DriverRegistrationPort');

export interface DriverRegistrationPort {
  register(driver: Driver, membership?: TenantMember): Promise<void>;
}
