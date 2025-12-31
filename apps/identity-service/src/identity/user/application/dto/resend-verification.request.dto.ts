import { RequiredString } from '@app/common';

export class ResendVerificationRequestDto {
  @RequiredString()
  verificationToken: string;
}
