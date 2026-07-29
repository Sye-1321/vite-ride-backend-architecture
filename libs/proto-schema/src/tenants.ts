export const TENANTS_PACKAGE_NAME = 'tenants';
export const TENANTS_SERVICE_NAME = 'TenantsService';

export enum ProtoTenantStatus {
  TENANT_STATUS_UNSPECIFIED = 0,
  TENANT_STATUS_ACTIVE = 1,
  TENANT_STATUS_INACTIVE = 2,
  TENANT_STATUS_SUSPENDED = 3,
}

export enum ProtoMemberRole {
  MEMBER_ROLE_UNSPECIFIED = 0,
  MEMBER_ROLE_ADMIN = 1,
  MEMBER_ROLE_DRIVER = 2,
}

export enum ProtoMemberStatus {
  MEMBER_STATUS_UNSPECIFIED = 0,
  MEMBER_STATUS_ACTIVE = 1,
  MEMBER_STATUS_SUSPENDED = 2,
}

export type TenantsEmpty = Record<string, never>;

export interface CreateTenantRequest {
  name: string;
  ownerUserId: string;
}

export interface TenantIdRequest {
  tenantId: string;
}

export interface UpdateTenantRequest {
  tenantId: string;
  name: string;
}

export interface ChangeTenantStatusRequest {
  tenantId: string;
  status: ProtoTenantStatus;
}

export interface ListTenantsRequest {
  page: number;
  limit: number;
  status: ProtoTenantStatus;
}

export interface TenantResponse {
  id: string;
  name: string;
  status: ProtoTenantStatus;
}

export interface TenantListResponse {
  data: TenantResponse[];
  page: number;
  limit: number;
  total: string;
}

export interface MemberRequest {
  tenantId: string;
  userId: string;
  role: ProtoMemberRole;
}

export interface MemberIdRequest {
  tenantId: string;
  userId: string;
}

export interface ListMembersRequest {
  tenantId: string;
  page: number;
  limit: number;
}

export interface MemberResponse {
  id: string;
  tenantId: string;
  userId: string;
  role: ProtoMemberRole;
  status: ProtoMemberStatus;
}

export interface MemberListResponse {
  data: MemberResponse[];
  page: number;
  limit: number;
  total: string;
}

export interface DriverRequest {
  tenantId: string;
  userId: string;
}

export interface DriverResponse {
  id: string;
  tenantId: string;
  userId: string;
}

export interface TenantsHealthResponse {
  status: string;
}
