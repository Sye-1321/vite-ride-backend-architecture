import { OtpGeneratorPort } from '@app/shared-kernel';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NumericOtpGenerator implements OtpGeneratorPort {
  generateOtp(length: number): string {
    return [...Array(length)].map(() => Math.floor(Math.random() * 10)).join('');
  }
}
