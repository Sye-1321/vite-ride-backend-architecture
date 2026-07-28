import { status } from '@grpc/grpc-js';
import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { AssignRoleDto, GetUserRolesDto } from '../dto';
import { RoleAssignmentPort } from '../ports';

import { TYPES } from '@app/shared-kernel';

@Injectable()
export class RoleAssignmentService {
  constructor(
    @Inject(TYPES.RoleAssignmentPort)
    private readonly rolePort: RoleAssignmentPort,
  ) {}

  async assignRole(dto: AssignRoleDto): Promise<{ changed: boolean; roles: string[] }> {
    this.validateRoleRequest(dto);
    return this.rolePort.assignRole(dto);
  }

  async removeRole(dto: AssignRoleDto): Promise<{ changed: boolean; roles: string[] }> {
    this.validateRoleRequest(dto);
    return this.rolePort.removeRole(dto);
  }

  async readUserRoles(dto: GetUserRolesDto): Promise<{ roles: string[] }> {
    if (!dto.userId?.trim()) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'userId is required',
      });
    }

    return this.rolePort.readUserRoles(dto);
  }

  private validateRoleRequest(dto: AssignRoleDto): void {
    if (!dto.userId?.trim() || !dto.role?.trim()) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'userId and role are required',
      });
    }
  }
}
