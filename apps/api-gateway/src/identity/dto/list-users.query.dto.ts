import { IsOptional, IsEnum } from 'class-validator';
import { PaginationQueryDto } from './pagination.query.dto';
import { ApiUserStatus } from './enums';

export class ListUsersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ApiUserStatus)
  status?: ApiUserStatus;
}
