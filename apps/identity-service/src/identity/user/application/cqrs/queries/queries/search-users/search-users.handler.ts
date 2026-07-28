import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Ok, Result } from 'oxide.ts';

import { SearchUsersQuery } from './search-users.query';
import { Paginated, TYPES } from '@app/shared-kernel';
import { UserRepositoryPort } from '../../../../ports';
import { UserResponseDto } from '../../../../dto/user.response.dto';
import { UserParser } from '../../../../user.parser';

@QueryHandler(SearchUsersQuery)
export class SearchUsersHandler implements IQueryHandler<SearchUsersQuery> {
  constructor(
    @Inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(query: SearchUsersQuery): Promise<Result<Paginated<UserResponseDto>, never>> {
    const filter: Record<string, any> = {};

    if (query.phoneNumber) {
      filter.phoneNumber = {
        $regex: query.phoneNumber,
        $options: 'i',
      };
    }

    if (query.name) {
      filter.$or = [
        { firstName: { $regex: query.name, $options: 'i' } },
        { lastName: { $regex: query.name, $options: 'i' } },
      ];
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
