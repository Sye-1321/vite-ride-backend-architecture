import { Option } from 'oxide.ts';
import { RepositoryPort } from '@app/shared-kernel';
import { TenantMember } from '../../domain/membership.entity';
import { TenantMemberRole } from '../../domain/membership.types';

export interface TenantMemberRepositoryPort
  extends RepositoryPort<TenantMember> {

  findByTenantAndUser(
    tenantId: string,
    userId: string,
  ): Promise<Option<TenantMember>>;

  exists(
    tenantId: string,
    userId: string,
    role: TenantMemberRole,
  ): Promise<boolean>;
}
