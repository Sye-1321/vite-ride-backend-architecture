import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Ok, Result } from 'oxide.ts';

import { ListUsersQuery } from './list-users.query';
import { Paginated, TYPES } from '@app/shared-kernel';
import { UserRepositoryPort } from '../../../../ports';
import { UserResponseDto } from '../../../../dto/user.response.dto';
import { UserParser } from '../../../../user.parser';

@QueryHandler(ListUsersQuery)
export class ListUsersHandler
  implements IQueryHandler<ListUsersQuery>
{
  constructor(
    @Inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(
    query: ListUsersQuery,
  ): Promise<Result<Paginated<UserResponseDto>, never>> {
    const filter: Record<string, any> = {};

    if (query.status !== undefined) {
      filter.status = query.status;
    }

    if (query.isDeleted !== undefined) {
      filter.isDeleted = query.isDeleted;
    }

    const result = await this.userRepository.findAllPaginated(
      {
        limit: query.limit,
        offset: query.offset,
        page: query.page,
        orderBy: query.orderBy,
      },
      filter,
    );

    return Ok(
      new Paginated({
        data: UserParser.usersResponse(result.data),
        count: result.count,
        limit: result.limit,
        page: result.page,
      }),
    );
  }
}
