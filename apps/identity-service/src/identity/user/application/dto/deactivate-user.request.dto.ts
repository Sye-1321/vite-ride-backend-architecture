import { RequiredString } from '@app/common';

export class DeactivateUserRequestDto {
  @RequiredString()
  userId: string;
}
