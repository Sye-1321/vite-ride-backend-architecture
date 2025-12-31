import { RequiredString } from '@app/common';

export class SuspendUserRequestDto {
  @RequiredString()
  userId: string;
}
