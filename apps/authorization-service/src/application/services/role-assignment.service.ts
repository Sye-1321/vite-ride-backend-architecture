import { Inject, Injectable } from '@nestjs/common';

import { AssignRoleDto, GetUserRolesDto } from '../dto';
import { RoleAssignmentPort } from '../ports';

import { TYPES } from '@app/shared-kernel';

@Injectable()
export class RoleAssignmentService {
  constructor(
    @Inject(TYPES.RoleAssignmentPort)
    private readonly rolePort: RoleAssignmentPort,
  ) {}

  async assignRole(dto: AssignRoleDto) {
    return this.rolePort.assignRole(dto);
  }

  async readUserRoles(dto: GetUserRolesDto) {
    return this.rolePort.readUserRoles(dto);
  }
}
