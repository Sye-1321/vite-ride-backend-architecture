import { Injectable } from '@nestjs/common';
import { None, Option, Some } from 'oxide.ts';

import { TenantMemberRepositoryPort } from '../../membership/application/ports';
import { TenantMember } from '../../membership/domain/membership.entity';
import { TenantMemberRole } from '../../membership/domain/membership.types';
import { InMemoryRepositoryBase } from './in-memory.repository.base';

@Injectable()
export class TenantMemberInMemoryRepository
  extends InMemoryRepositoryBase<TenantMember>
  implements TenantMemberRepositoryPort
{
  async findByTenantAndUser(tenantId: string, userId: string): Promise<Option<TenantMember>> {
    const member = [...this.records.values()].find(
      (candidate) => candidate.tenantId === tenantId && candidate.userId === userId,
    );
    return member ? Some(member) : None;
  }

  async exists(tenantId: string, userId: string, role: TenantMemberRole): Promise<boolean> {
    return [...this.records.values()].some(
      (candidate) =>
        candidate.tenantId === tenantId && candidate.userId === userId && candidate.role === role,
    );
  }
}
