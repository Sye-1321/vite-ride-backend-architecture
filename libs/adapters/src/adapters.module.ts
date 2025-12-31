import { Global, Module } from '@nestjs/common';
import { TYPES } from '@app/shared-kernel';

import { BcryptHasher } from './bcrypt-hasher.adapter';
import { NumericOtpGenerator } from './numeric-otp-generator.adapter';
import { RandomTokenGenerator } from './token-generator.adapter';

@Global()
@Module({
  providers: [
    { provide: TYPES.HasherPort, useClass: BcryptHasher },
    { provide: TYPES.OtpGeneratorPort, useClass: NumericOtpGenerator },
    { provide: TYPES.TokenGeneratorPort, useClass: RandomTokenGenerator },
  ],
  exports: [
    TYPES.HasherPort,
    TYPES.OtpGeneratorPort,
    TYPES.TokenGeneratorPort,
  ],
})
export class AdaptersModule {}
