import { AppLoggerAdapter } from './app-logger.adapter';

describe('AppLoggerAdapter', () => {
  it('writes structured entries with stable context', () => {
    const lines: string[] = [];
    const logger = new AppLoggerAdapter('tenants-service', (line) => lines.push(line));

    logger.log('tenant created', { tenantId: 'tenant-a', outcome: 'created' });

    expect(JSON.parse(lines[0])).toMatchObject({
      level: 'info',
      service: 'tenants-service',
      message: 'tenant created',
      details: {
        tenantId: 'tenant-a',
        outcome: 'created',
      },
    });
  });

  it('redacts sensitive values recursively', () => {
    const lines: string[] = [];
    const logger = new AppLoggerAdapter('notifications-service', (line) => lines.push(line));

    logger.log('delivery accepted', {
      recipient: '+251900000000',
      payload: {
        otp: '123456',
        deviceTokens: ['device-a'],
        safeDeliveryId: 'delivery-a',
      },
    });

    const output = lines[0];
    expect(output).not.toContain('+251900000000');
    expect(output).not.toContain('123456');
    expect(output).not.toContain('device-a');
    expect(output).toContain('delivery-a');
    expect(output).toContain('[REDACTED]');
  });

  it('serializes errors and circular metadata safely', () => {
    const lines: string[] = [];
    const logger = new AppLoggerAdapter('api-gateway', (line) => lines.push(line));
    const details: Record<string, unknown> = { operation: 'authorize' };
    details.self = details;

    expect(() =>
      logger.error('request failed', new Error('upstream unavailable'), details),
    ).not.toThrow();

    const entry = JSON.parse(lines[0]);
    expect(entry).toMatchObject({
      level: 'error',
      service: 'api-gateway',
      message: 'request failed',
    });
    expect(lines[0]).toContain('[CIRCULAR]');
  });
});
