import { QueryBase } from '@app/shared-kernel';

export class GetMyProfileQuery extends QueryBase {
  readonly userId: string;

  constructor(userId: string) {
    super();
    this.userId = userId;
  }
}
