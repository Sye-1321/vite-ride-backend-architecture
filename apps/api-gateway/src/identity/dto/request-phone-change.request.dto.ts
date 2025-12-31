import { RequiredString, IsEthiopianPhone } from '@app/common';

export class RequestPhoneChangeRequestDto {
  @RequiredString()
  @IsEthiopianPhone()
  newPhoneNumber: string;

  @RequiredString()
  currentPassword: string;
}