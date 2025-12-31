import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';

import { GetMyProfileQuery } from './get-my-profile.query';
import { TYPES } from '@app/shared-kernel';
import { NotFoundException } from '@app/common';
import { UserRepositoryPort } from '../../../../ports';
import { UserResponseDto } from '../../../../dto/user.response.dto';
import { UserParser } from '../../../../user.parser';

type GetMyProfileErrors = NotFoundException;

@QueryHandler(GetMyProfileQuery)
export class GetMyProfileHandler
  implements IQueryHandler<GetMyProfileQuery>
{
  constructor(
    @Inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(
    query: GetMyProfileQuery,
  ): Promise<Result<UserResponseDto, GetMyProfileErrors>> {
    const found = await this.userRepository.findById(query.userId);

    if (found.isNone()) {
      return Err(new NotFoundException('User not found'));
    }

    const user = found.unwrap();


    return Ok(
      UserParser.createUserResponse(user),
    );
  }
}
