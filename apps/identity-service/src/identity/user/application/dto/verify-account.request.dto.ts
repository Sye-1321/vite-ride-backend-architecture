import { RequiredString } from '@app/common';

export class VerifyAccountRequestDto {
  @RequiredString()
  otp: string;

  @RequiredString()
  verificationToken: string;
}
