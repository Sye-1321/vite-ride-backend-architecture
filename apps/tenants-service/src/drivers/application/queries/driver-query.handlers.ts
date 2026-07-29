import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ApplicationError, requiredText } from '@app/application-core';
import { TYPES } from '@app/shared-kernel';

import { Driver } from '../../domain/driver.entity';
import { DriverRepositoryPort } from '../ports';
import { GetDriverQuery } from './driver.queries';

@QueryHandler(GetDriverQuery)
export class GetDriverHandler implements IQueryHandler<GetDriverQuery> {
  constructor(
    @Inject(TYPES.DriverRepositoryPort)
    private readonly drivers: DriverRepositoryPort,
  ) {}

  async execute(query: GetDriverQuery): Promise<Driver> {
    const found = await this.drivers.findByUserIdAndTenantId(
      requiredText(query.userId, 'userId'),
      requiredText(query.tenantId, 'tenantId'),
    );
    if (found.isNone()) {
      throw new ApplicationError('NOT_FOUND', 'Driver not found');
    }
    return found.unwrap();
  }
}

export const DriverQueryHandlers = [GetDriverHandler];
