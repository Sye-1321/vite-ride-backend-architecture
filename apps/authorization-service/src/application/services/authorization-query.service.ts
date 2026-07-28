import { status } from '@grpc/grpc-js';
import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { AccessCheckDto } from '../dto';
import { AuthorizationQueryPort } from '../ports';

import { TYPES } from '@app/shared-kernel';

@Injectable()
export class AuthorizationQueryService {
  constructor(
    @Inject(TYPES.AuthorizationQueryPort)
    private readonly queryPort: AuthorizationQueryPort,
  ) {}

  async canAccess(dto: AccessCheckDto): Promise<{ allowed: boolean }> {
    if (!dto.sub?.trim() || !dto.obj?.trim() || !dto.act?.trim()) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'userId, resource, and action are required',
      });
    }

    return this.queryPort.canAccess(dto);
  }
}
