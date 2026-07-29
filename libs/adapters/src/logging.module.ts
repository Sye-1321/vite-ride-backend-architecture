import { Global, Module } from '@nestjs/common';

import { TYPES } from '@app/shared-kernel';

import { AppLoggerAdapter } from './app-logger.adapter';

@Global()
@Module({
  providers: [
    AppLoggerAdapter,
    {
      provide: TYPES.LoggerPort,
      useExisting: AppLoggerAdapter,
    },
  ],
  exports: [AppLoggerAdapter, TYPES.LoggerPort],
})
export class LoggingModule {}
