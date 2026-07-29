import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ApplicationError, requiredText } from '@app/application-core';
import { Paginated, TYPES } from '@app/shared-kernel';

import { TenantRepositoryPort } from '../../../tenants/application/ports';
import { TenantMember } from '../../domain/membership.entity';
import { TenantMemberRepositoryPort } from '../ports';
import { ListMembersQuery } from './membership.queries';

@QueryHandler(ListMembersQuery)
export class ListMembersHandler implements IQueryHandler<ListMembersQuery> {
  constructor(
    @Inject(TYPES.TenantRepositoryPort)
    private readonly tenants: TenantRepositoryPort,
    @Inject(TYPES.TenantMemberRepositoryPort)
    private readonly members: TenantMemberRepositoryPort,
  ) {}

  async execute(query: ListMembersQuery): Promise<Paginated<TenantMember>> {
    const tenantId = requiredText(query.tenantId, 'tenantId');
    if ((await this.tenants.findById(tenantId)).isNone()) {
      throw new ApplicationError('NOT_FOUND', 'Tenant not found');
    }

    const page = Number.isInteger(query.page) && query.page > 0 ? query.page : 1;
    const limit =
      Number.isInteger(query.limit) && query.limit > 0 ? Math.min(query.limit, 100) : 20;

    return this.members.findAllPaginated(
      { page, limit, offset: (page - 1) * limit },
      { tenantId, isDeleted: { $ne: true } },
    );
  }
}

export const MembershipQueryHandlers = [ListMembersHandler];
