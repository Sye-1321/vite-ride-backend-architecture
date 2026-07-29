import { Global, Module } from '@nestjs/common';
import { TYPES } from '@app/shared-kernel';

import { BcryptHasher } from './bcrypt-hasher.adapter';
import { LoggingModule } from './logging.module';
import { NumericOtpGenerator } from './numeric-otp-generator.adapter';
import { RandomTokenGenerator } from './token-generator.adapter';

@Global()
@Module({
  imports: [LoggingModule],
  providers: [
    { provide: TYPES.HasherPort, useClass: BcryptHasher },
    { provide: TYPES.OtpGeneratorPort, useClass: NumericOtpGenerator },
    { provide: TYPES.TokenGeneratorPort, useClass: RandomTokenGenerator },
  ],
  exports: [LoggingModule, TYPES.HasherPort, TYPES.OtpGeneratorPort, TYPES.TokenGeneratorPort],
})
export class AdaptersModule {}
