import { SetMetadata } from '@nestjs/common';

export const REQUIRED_PERMISSION = 'required-permission';

export interface RequiredPermission {
  resource: string;
  action: string;
}

export const RequirePermission = (resource: string, action: string) =>
  SetMetadata(REQUIRED_PERMISSION, { resource, action } satisfies RequiredPermission);
