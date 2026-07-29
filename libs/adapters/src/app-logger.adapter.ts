import { Injectable, LoggerService, Optional } from '@nestjs/common';

import { LoggerPort } from '@app/shared-kernel';

type LogLevel = 'debug' | 'error' | 'fatal' | 'info' | 'trace' | 'warn';
type LogSink = (line: string, level: LogLevel) => void;

interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  context?: string;
  message: string;
  details?: unknown;
}

const REDACTED = '[REDACTED]';
const SENSITIVE_KEYS = [
  'authorization',
  'cookie',
  'credential',
  'devicetoken',
  'firebasemessage',
  'messagebody',
  'otp',
  'password',
  'phonenumber',
  'privatekey',
  'recipient',
  'refreshtoken',
  'secret',
  'token',
  'tokens',
];

@Injectable()
export class AppLoggerAdapter implements LoggerPort, LoggerService {
  constructor(
    @Optional()
    private readonly service = process.env.SERVICE_NAME || 'vite-ride',
    @Optional()
    private readonly sink: LogSink = AppLoggerAdapter.defaultSink,
  ) {}

  log(message: string, ...meta: unknown[]): void {
    this.write('info', message, meta);
  }

  error(message: string, trace?: unknown, ...meta: unknown[]): void {
    this.write('error', message, trace === undefined ? meta : [trace, ...meta]);
  }

  warn(message: string, ...meta: unknown[]): void {
    this.write('warn', message, meta);
  }

  debug(message: string, ...meta: unknown[]): void {
    this.write('debug', message, meta);
  }

  verbose(message: string, ...meta: unknown[]): void {
    this.write('trace', message, meta);
  }

  fatal(message: string, ...meta: unknown[]): void {
    this.write('fatal', message, meta);
  }

  private write(level: LogLevel, message: string, meta: unknown[]): void {
    const optionalContext =
      typeof meta[meta.length - 1] === 'string' && meta.length > 1 ? String(meta.pop()) : undefined;
    const details = meta.length ? this.sanitize(meta.length === 1 ? meta[0] : meta) : undefined;
    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      ...(optionalContext ? { context: optionalContext } : {}),
      message,
      ...(details === undefined ? {} : { details }),
    };

    this.sink(JSON.stringify(entry), level);
  }

  private sanitize(value: unknown, seen = new WeakSet<object>()): unknown {
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item, seen));
    }
    if (!value || typeof value !== 'object') {
      return value;
    }
    if (seen.has(value)) {
      return '[CIRCULAR]';
    }

    seen.add(value);
    const sanitized: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      sanitized[key] = this.isSensitiveKey(key) ? REDACTED : this.sanitize(item, seen);
    }
    return sanitized;
  }

  private isSensitiveKey(key: string): boolean {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    return (
      normalized === 'to' ||
      normalized === 'body' ||
      SENSITIVE_KEYS.some((sensitive) => normalized.includes(sensitive))
    );
  }

  private static defaultSink(line: string, level: LogLevel): void {
    const stream = level === 'error' || level === 'fatal' ? process.stderr : process.stdout;
    stream.write(`${line}\n`);
  }
}
