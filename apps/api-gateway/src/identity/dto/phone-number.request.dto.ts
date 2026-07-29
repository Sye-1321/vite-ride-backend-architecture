import { RequiredString, IsEthiopianPhone } from '@app/common';

export class PhoneNumberRequestDto {
  @RequiredString()
  @IsEthiopianPhone()
  phoneNumber: string;
}
