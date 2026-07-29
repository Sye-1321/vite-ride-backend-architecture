import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ApplicationError, requiredText } from '@app/application-core';
import { Paginated, TYPES } from '@app/shared-kernel';

import { TenantMemberRepositoryPort } from '../../../membership/application/ports';
import { Tenant } from '../../domain/tenant.entity';
import { TenantRepositoryPort } from '../ports';
import { GetTenantQuery, ListTenantsQuery } from './tenant.queries';

@QueryHandler(GetTenantQuery)
export class GetTenantHandler implements IQueryHandler<GetTenantQuery> {
  constructor(
    @Inject(TYPES.TenantRepositoryPort)
    private readonly tenants: TenantRepositoryPort,
  ) {}

  async execute(query: GetTenantQuery): Promise<Tenant> {
    const found = await this.tenants.findById(requiredText(query.tenantId, 'tenantId'));
    if (found.isNone()) {
      throw new ApplicationError('NOT_FOUND', 'Tenant not found');
    }
    return found.unwrap();
  }
}

@QueryHandler(ListTenantsQuery)
export class ListTenantsHandler implements IQueryHandler<ListTenantsQuery> {
  constructor(
    @Inject(TYPES.TenantRepositoryPort)
    private readonly tenants: TenantRepositoryPort,
    @Inject(TYPES.TenantMemberRepositoryPort)
    private readonly members: TenantMemberRepositoryPort,
  ) {}

  async execute(query: ListTenantsQuery): Promise<Paginated<Tenant>> {
    const userId = requiredText(query.userId, 'userId');
    const page = Number.isInteger(query.page) && query.page > 0 ? query.page : 1;
    const limit =
      Number.isInteger(query.limit) && query.limit > 0 ? Math.min(query.limit, 100) : 20;
    const tenantIds = await this.members.findActiveTenantIdsByUserId(userId);

    if (tenantIds.length === 0) {
      return new Paginated({ data: [], count: 0, page, limit });
    }

    return this.tenants.findAllPaginated(
      { page, limit, offset: (page - 1) * limit },
      query.status
        ? { _id: { $in: tenantIds }, status: query.status, isDeleted: { $ne: true } }
        : { _id: { $in: tenantIds }, isDeleted: { $ne: true } },
    );
  }
}

export const TenantQueryHandlers = [GetTenantHandler];
