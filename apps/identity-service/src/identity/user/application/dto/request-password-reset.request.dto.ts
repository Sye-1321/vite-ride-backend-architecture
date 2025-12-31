import { RequiredString, IsEthiopianPhone } from '@app/common';

export class RequestPasswordResetRequestDto {
  @RequiredString()
  @IsEthiopianPhone()
  phoneNumber: string;
}
