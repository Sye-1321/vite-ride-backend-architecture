import { TenantMemberRole } from '../../domain/membership.types';

export class AddMemberCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly role: TenantMemberRole,
  ) {}
}

export class SuspendMemberCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
  ) {}
}

export class RemoveMemberCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
  ) {}
}
