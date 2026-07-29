import { Option } from 'oxide.ts';
import { RepositoryPort } from '@app/shared-kernel';
import { Tenant } from '../../domain/tenant.entity';

export interface TenantRepositoryPort extends RepositoryPort<Tenant> {
  findByName(name: string): Promise<Option<Tenant>>;
}
