import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { AuthorizationGuard, RequirePermission } from '@app/application-core';
import { AccessAuthGuard, GetCurrentUserId } from '@app/common';
import { ProtoTenantStatus } from '@app/proto-schema';

import { AuthorizationGrpcClient } from '../authorization/authorization.grpc.client';
import {
  AddMemberDto,
  ChangeTenantStatusDto,
  CreateTenantDto,
  ListTenantsDto,
  RegisterDriverDto,
  TenantPaginationDto,
  UpdateTenantDto,
} from './dto/tenant.request.dto';
import { TenantsGrpcClient } from './tenants.grpc.client';

@Controller('tenants')
@UseGuards(AccessAuthGuard)
export class TenantsController {
  constructor(
    private readonly tenants: TenantsGrpcClient,
    private readonly authorization: AuthorizationGrpcClient,
  ) {}

  @Post()
  async createTenant(@GetCurrentUserId() ownerUserId: string, @Body() dto: CreateTenantDto) {
    const tenant = await firstValueFrom(this.tenants.createTenant({ name: dto.name, ownerUserId }));
    await firstValueFrom(
      this.authorization.assignRole({
        userId: ownerUserId,
        domain: tenant.id,
        role: 'tenant-admin',
      }),
    );
    return tenant;
  }

  @Get()
  listTenants(@Query() query: ListTenantsDto) {
    return this.tenants.listTenants({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      status: query.status ?? ProtoTenantStatus.TENANT_STATUS_UNSPECIFIED,
    });
  }

  @Get(':tenantId')
  @RequirePermission('tenant', 'read')
  @UseGuards(AuthorizationGuard)
  getTenant(@Param('tenantId') tenantId: string) {
    return this.tenants.getTenant({ tenantId });
  }

  @Patch(':tenantId')
  @RequirePermission('tenant', 'update')
  @UseGuards(AuthorizationGuard)
  updateTenant(@Param('tenantId') tenantId: string, @Body() dto: UpdateTenantDto) {
    return this.tenants.updateTenant({ tenantId, name: dto.name });
  }

  @Patch(':tenantId/status')
  @RequirePermission('tenant', 'update')
  @UseGuards(AuthorizationGuard)
  changeStatus(@Param('tenantId') tenantId: string, @Body() dto: ChangeTenantStatusDto) {
    return this.tenants.changeTenantStatus({
      tenantId,
      status: dto.status,
    });
  }

  @Post(':tenantId/members')
  @RequirePermission('tenant', 'manage-members')
  @UseGuards(AuthorizationGuard)
  addMember(@Param('tenantId') tenantId: string, @Body() dto: AddMemberDto) {
    return this.tenants.addMember({ tenantId, ...dto });
  }

  @Patch(':tenantId/members/:userId/suspend')
  @RequirePermission('tenant', 'manage-members')
  @UseGuards(AuthorizationGuard)
  suspendMember(@Param('tenantId') tenantId: string, @Param('userId') userId: string) {
    return this.tenants.suspendMember({ tenantId, userId });
  }

  @Delete(':tenantId/members/:userId')
  @RequirePermission('tenant', 'manage-members')
  @UseGuards(AuthorizationGuard)
  removeMember(@Param('tenantId') tenantId: string, @Param('userId') userId: string) {
    return this.tenants.removeMember({ tenantId, userId });
  }

  @Get(':tenantId/members')
  @RequirePermission('tenant', 'manage-members')
  @UseGuards(AuthorizationGuard)
  listMembers(@Param('tenantId') tenantId: string, @Query() query: TenantPaginationDto) {
    return this.tenants.listMembers({
      tenantId,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  @Post(':tenantId/drivers')
  @RequirePermission('tenant', 'manage-drivers')
  @UseGuards(AuthorizationGuard)
  registerDriver(@Param('tenantId') tenantId: string, @Body() dto: RegisterDriverDto) {
    return this.tenants.registerDriver({ tenantId, userId: dto.userId });
  }

  @Get(':tenantId/drivers/:userId')
  @RequirePermission('tenant', 'manage-drivers')
  @UseGuards(AuthorizationGuard)
  getDriver(@Param('tenantId') tenantId: string, @Param('userId') userId: string) {
    return this.tenants.getDriver({ tenantId, userId });
  }
}
