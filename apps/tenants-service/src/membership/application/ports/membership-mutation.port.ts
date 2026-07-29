import { TenantMember } from '../../domain/membership.entity';

export const MEMBERSHIP_MUTATION_PORT = Symbol('MEMBERSHIP_MUTATION_PORT');

export interface MembershipMutationPort {
  add(member: TenantMember): Promise<void>;

  suspend(member: TenantMember): Promise<void>;

  remove(member: TenantMember): Promise<void>;
}
