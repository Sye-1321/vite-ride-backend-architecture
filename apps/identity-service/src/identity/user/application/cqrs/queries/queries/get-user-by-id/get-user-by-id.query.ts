import { QueryBase } from '@app/shared-kernel';

export class GetUserByIdQuery extends QueryBase {
  readonly userId: string;

  constructor(userId: string) {
    super();
    this.userId = userId;
  }
}
