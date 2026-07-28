export const AUTHORIZATION_PACKAGE_NAME = 'authorization';
export const AUTHORIZATION_SERVICE_NAME = 'AuthorizationService';

export interface AuthorizationEmpty {}

export interface AccessCheckRequest {
  userId: string;
  domain: string;
  resource: string;
  action: string;
}

export interface AccessCheckResponse {
  allowed: boolean;
}

export interface RoleRequest {
  userId: string;
  domain: string;
  role: string;
}

export interface GetRolesRequest {
  userId: string;
  domain: string;
}

export interface RoleResponse {
  changed: boolean;
  roles: string[];
}

export interface GetRolesResponse {
  roles: string[];
}

export interface AuthorizationHealthResponse {
  status: string;
}
