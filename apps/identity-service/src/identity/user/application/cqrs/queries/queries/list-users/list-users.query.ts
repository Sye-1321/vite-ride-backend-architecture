import { PaginatedQueryBase, PaginatedParams } from '@app/shared-kernel';
import { UserStatus } from 'apps/identity-service/src/identity/user/domain/user.types';

export class ListUsersQuery extends PaginatedQueryBase {
  readonly status?: UserStatus;
  readonly isDeleted?: boolean;

  constructor(props: PaginatedParams<ListUsersQuery>) {
    super(props);
    this.status = props.status;
    this.isDeleted = props.isDeleted;
  }
}
