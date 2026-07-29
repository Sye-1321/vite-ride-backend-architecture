import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ApplicationError, requiredText } from '@app/application-core';
import { Paginated, TYPES } from '@app/shared-kernel';

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
  ) {}

  execute(query: ListTenantsQuery): Promise<Paginated<Tenant>> {
    const page = Number.isInteger(query.page) && query.page > 0 ? query.page : 1;
    const limit =
      Number.isInteger(query.limit) && query.limit > 0 ? Math.min(query.limit, 100) : 20;

    return this.tenants.findAllPaginated(
      { page, limit, offset: (page - 1) * limit },
      query.status
        ? { status: query.status, isDeleted: { $ne: true } }
        : { isDeleted: { $ne: true } },
    );
  }
}

export const TenantQueryHandlers = [GetTenantHandler, ListTenantsHandler];
