import { AssignRoleDto, GetUserRolesDto } from '../dto';

export interface RoleAssignmentPort {
  assignRole(dto: AssignRoleDto): Promise<{ changed: boolean; roles: string[] }>;

  removeRole(dto: AssignRoleDto): Promise<{ changed: boolean; roles: string[] }>;

  readUserRoles(dto: GetUserRolesDto): Promise<{ roles: string[] }>;
}
