import { QueryBase } from '@app/shared-kernel';

export class CheckUserExistsByPhoneQuery extends QueryBase {
  readonly phoneNumber: string;

  constructor(phoneNumber: string) {
    super();
    this.phoneNumber = phoneNumber;
  }
}
