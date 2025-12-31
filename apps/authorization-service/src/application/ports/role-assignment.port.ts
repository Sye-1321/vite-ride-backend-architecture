import { AssignRoleDto, GetUserRolesDto } from '../dto';

export interface RoleAssignmentPort {
  assignRole(
    dto: AssignRoleDto,
  ): Promise<{ success: boolean; roles: string[] }>;

  readUserRoles(
    dto: GetUserRolesDto,
  ): Promise<{ roles: string[] }>;
}
