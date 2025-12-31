import { RequiredString } from '@app/common';

export class LoginRequestDto {
  @RequiredString()
  phoneNumber: string;

  @RequiredString()
  password: string;
}