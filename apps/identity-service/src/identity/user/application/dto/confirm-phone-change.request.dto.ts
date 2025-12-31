import { RequiredString } from '@app/common';

export class ConfirmPhoneChangeRequestDto {
  @RequiredString()
  otp: string;

  @RequiredString()
  verificationToken: string;
}
