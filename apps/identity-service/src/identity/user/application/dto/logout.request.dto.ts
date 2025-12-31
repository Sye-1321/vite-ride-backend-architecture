import { RequiredString } from '@app/common';

export class LogoutRequestDto {
  @RequiredString()
  userId: string;
}
