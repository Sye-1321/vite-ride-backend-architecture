import { RequiredString, PasswordStrength, PasswordsMatch } from '@app/common';

export class ChangePasswordRequestDto {
  @RequiredString()
  currentPassword: string;

  @RequiredString()
  @PasswordStrength()
  newPassword: string;

  @RequiredString()
  @PasswordsMatch('newPassword')
  confirmNewPassword: string;
}
