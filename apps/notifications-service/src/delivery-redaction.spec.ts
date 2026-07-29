import { LoggerPort } from '@app/shared-kernel';

import { DryRunPushAdapter } from './push/dry-run-push.adapter';
import { DryRunSmsAdapter } from './sms/dry-run-sms.adapter';

describe('dry-run notification adapters', () => {
  const logger = (): jest.Mocked<LoggerPort> => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    fatal: jest.fn(),
  });

  it('logs delivery metadata without logging SMS content or recipients', async () => {
    const structuredLogger = logger();
    const result = await new DryRunSmsAdapter(structuredLogger).sendSms({
      to: 'private-recipient',
      message: 'private-message',
      correlationId: 'private-correlation',
    });

    expect(result.outcome).toBe('accepted');
    expect(JSON.stringify(structuredLogger.log.mock.calls)).not.toContain('private-');
  });

  it('logs delivery metadata without logging push tokens or content', async () => {
    const structuredLogger = logger();
    const result = await new DryRunPushAdapter(structuredLogger).sendPush({
      tokens: ['private-token'],
      title: 'private-title',
      body: 'private-body',
      correlationId: 'private-correlation',
    });

    expect(result.outcome).toBe('accepted');
    expect(JSON.stringify(structuredLogger.log.mock.calls)).not.toContain('private-');
  });
});
