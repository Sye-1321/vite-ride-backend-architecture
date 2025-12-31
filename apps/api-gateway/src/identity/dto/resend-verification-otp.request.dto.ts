import { IsEnum, IsString } from 'class-validator';
import { UserVerificationPurpose } from './enums';

export class ResendVerificationOtpRequestDto {
  @IsString()
  verificationToken: string;

  @IsEnum(UserVerificationPurpose)
  purpose: UserVerificationPurpose;
}
