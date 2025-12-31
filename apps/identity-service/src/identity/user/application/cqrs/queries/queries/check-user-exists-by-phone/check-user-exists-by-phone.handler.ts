import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Ok, Result } from 'oxide.ts';

import { CheckUserExistsByPhoneQuery } from './check-user-exists-by-phone.query';
import { TYPES } from '@app/shared-kernel';
import { UserRepositoryPort } from '../../../../ports';

@QueryHandler(CheckUserExistsByPhoneQuery)
export class CheckUserExistsByPhoneHandler
  implements IQueryHandler<CheckUserExistsByPhoneQuery>
{
  constructor(
    @Inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(
    query: CheckUserExistsByPhoneQuery,
  ): Promise<Result<boolean, never>> {
    const found = await this.userRepository.findOne({
      phoneNumber: query.phoneNumber,
    });

    return Ok(found.isSome());
  }
}
