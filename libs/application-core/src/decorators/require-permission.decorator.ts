import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

export interface RequiredPermission {
  resource: string;
  action: PermissionAction;
}

export function RequirePermission(
  resource: string,
  action: PermissionAction,
): MethodDecorator {
  return SetMetadata(PERMISSION_KEY, { resource, action });
}
