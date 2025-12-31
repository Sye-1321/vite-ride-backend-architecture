import { LoggerPort } from '@app/shared-kernel';

export class AppLoggerAdapter implements LoggerPort {
  log(message: string) {
  }

  error(message: string, trace: string) {
  }

  warn(message: string) {
  }

  debug(message: string) {
  }

  verbose(message: string) {
  }
}
