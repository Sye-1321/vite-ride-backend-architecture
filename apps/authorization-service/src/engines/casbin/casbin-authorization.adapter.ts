import { Inject, Injectable } from '@nestjs/common';
import type { Enforcer } from 'casbin';

import { AuthorizationQueryPort, RoleAssignmentPort } from '../../application/ports';

import { AccessCheckDto, AssignRoleDto, GetUserRolesDto } from '../../application/dto';

import { TYPES } from '@app/shared-kernel';

@Injectable()
export class CasbinAuthorizationAdapter implements AuthorizationQueryPort, RoleAssignmentPort {
  constructor(
    @Inject(TYPES.AuthzEnforcerPort)
    private readonly enforcer: Enforcer,
  ) {}

  async canAccess(dto: AccessCheckDto) {
    const domain = dto.domain?.length ? dto.domain : '*';

    const allowed = await this.enforcer.enforce(domain, dto.sub, dto.obj, dto.act);

    return { allowed };
  }

  async assignRole(dto: AssignRoleDto) {
    const userKey = `${dto.domain}::${dto.userId}`;

    const added = await this.enforcer.addRoleForUser(userKey, dto.role);
    if (!added) {
      throw new Error('Role assignment failed');
    }

    const roles = await this.enforcer.getRolesForUser(userKey);
    return { success: true, roles };
  }

  async readUserRoles(dto: GetUserRolesDto) {
    const domain = dto.domain?.length ? dto.domain : '*';
    const userKey = `${domain}::${dto.userId}`;

    const roles = await this.enforcer.getRolesForUser(userKey);
    return { roles };
  }
}
