import { IsEnum, IsString } from 'class-validator';
import { ApiUserVerificationPurpose } from './enums';

export class ResendVerificationOtpRequestDto {
  @IsString()
  verificationToken: string;

  @IsEnum(ApiUserVerificationPurpose)
  purpose: ApiUserVerificationPurpose;
}
