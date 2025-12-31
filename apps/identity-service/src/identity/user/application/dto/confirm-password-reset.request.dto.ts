import { RequiredString, PasswordStrength } from '@app/common';

export class ConfirmPasswordResetRequestDto {
  @RequiredString()
  otp: string;

  @RequiredString()
  verificationToken: string;

  @RequiredString()
  @PasswordStrength()
  newPassword: string;
}
