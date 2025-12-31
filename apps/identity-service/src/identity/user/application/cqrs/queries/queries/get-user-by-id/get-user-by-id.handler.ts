import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';

import { GetUserByIdQuery } from './get-user-by-id.query';
import { TYPES } from '@app/shared-kernel';
import { NotFoundException } from '@app/common';
import { UserRepositoryPort } from '../../../../ports';
import { UserResponseDto } from '../../../../dto/user.response.dto';
import { UserParser } from '../../../../user.parser';

type GetUserByIdErrors = NotFoundException;

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler
  implements IQueryHandler<GetUserByIdQuery>
{
  constructor(
    @Inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(
    query: GetUserByIdQuery,
  ): Promise<Result<UserResponseDto, GetUserByIdErrors>> {
    const found = await this.userRepository.findById(query.userId);

    if (found.isNone()) {
      return Err(new NotFoundException('User not found'));
    }

    return Ok(
      UserParser.createUserResponse(found.unwrap()),
    );
  }
}
