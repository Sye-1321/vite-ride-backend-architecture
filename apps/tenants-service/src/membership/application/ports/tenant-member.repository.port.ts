import { Option } from 'oxide.ts';
import { RepositoryPort } from '@app/shared-kernel';
import { TenantMember } from '../../domain/membership.entity';

export interface TenantMemberRepositoryPort extends RepositoryPort<TenantMember> {
  findByTenantAndUser(tenantId: string, userId: string): Promise<Option<TenantMember>>;

  findActiveTenantIdsByUserId(userId: string): Promise<string[]>;
}
