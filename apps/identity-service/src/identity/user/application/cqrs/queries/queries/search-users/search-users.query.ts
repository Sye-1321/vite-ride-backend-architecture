import { PaginatedQueryBase, PaginatedParams } from '@app/shared-kernel';

export class SearchUsersQuery extends PaginatedQueryBase {
  readonly phoneNumber?: string;
  readonly name?: string;

  constructor(props: PaginatedParams<SearchUsersQuery>) {
    super(props);
    this.phoneNumber = props.phoneNumber;
    this.name = props.name;
  }
}
