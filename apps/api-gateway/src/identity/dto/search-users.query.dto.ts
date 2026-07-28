import { IsOptional, IsString, MinLength } from 'class-validator';
import { PaginationQueryDto } from './pagination.query.dto';

export class SearchUsersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;
}
