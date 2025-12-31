import { RequiredString, IsEthiopianPhone, PasswordStrength } from '@app/common';

export class RegisterUserRequestDto {
  @RequiredString()
  firstName: string;

  @RequiredString()
  lastName: string;

  @RequiredString()
  @IsEthiopianPhone()
  phoneNumber: string;

  @RequiredString()
  @PasswordStrength()
  password: string;
}