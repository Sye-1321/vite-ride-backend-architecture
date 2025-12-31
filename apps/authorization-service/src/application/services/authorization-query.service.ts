import { Inject, Injectable } from '@nestjs/common';

import { AccessCheckDto } from '../dto';
import { AuthorizationQueryPort } from '../ports';

import { TYPES } from '@app/shared-kernel';

@Injectable()
export class AuthorizationQueryService {
  constructor(
    @Inject(TYPES.AuthorizationQueryPort)
    private readonly queryPort: AuthorizationQueryPort,
  ) {}

  async canAccess(dto: AccessCheckDto) {
    return this.queryPort.canAccess(dto);
  }
}
