import { Global, Module } from '@nestjs/common';
import { TYPES } from '@app/shared-kernel';

import { BcryptHasher } from './bcrypt-hasher.adapter';
import { AppLoggerAdapter } from './app-logger.adapter';
import { NumericOtpGenerator } from './numeric-otp-generator.adapter';
import { RandomTokenGenerator } from './token-generator.adapter';

@Global()
@Module({
  providers: [
    { provide: TYPES.HasherPort, useClass: BcryptHasher },
    { provide: TYPES.OtpGeneratorPort, useClass: NumericOtpGenerator },
    { provide: TYPES.TokenGeneratorPort, useClass: RandomTokenGenerator },
    { provide: TYPES.LoggerPort, useClass: AppLoggerAdapter },
  ],
  exports: [TYPES.HasherPort, TYPES.OtpGeneratorPort, TYPES.TokenGeneratorPort, TYPES.LoggerPort],
})
export class AdaptersModule {}
