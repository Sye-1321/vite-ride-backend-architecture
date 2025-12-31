import { RequiredString, PasswordStrength, PasswordsMatch } from '@app/common';

export class ConfirmPasswordResetRequestDto {
  @RequiredString()
  otp: string;

  @RequiredString()
  verificationToken: string;

  @RequiredString()
  @PasswordStrength()
  newPassword: string;

  @RequiredString()
  @PasswordsMatch('newPassword')
  confirmNewPassword: string;
}
