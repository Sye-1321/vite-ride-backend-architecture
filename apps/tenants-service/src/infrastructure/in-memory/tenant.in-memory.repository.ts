import { Injectable } from '@nestjs/common';
import { None, Option, Some } from 'oxide.ts';

import { TenantRepositoryPort } from '../../tenants/application/ports';
import { Tenant } from '../../tenants/domain/tenant.entity';
import { InMemoryRepositoryBase } from './in-memory.repository.base';

@Injectable()
export class TenantInMemoryRepository
  extends InMemoryRepositoryBase<Tenant>
  implements TenantRepositoryPort
{
  async findByName(name: string): Promise<Option<Tenant>> {
    const normalized = name.trim().toLowerCase();
    const tenant = [...this.records.values()].find(
      (candidate) => candidate.name.trim().toLowerCase() === normalized,
    );
    return tenant ? Some(tenant) : None;
  }
}
