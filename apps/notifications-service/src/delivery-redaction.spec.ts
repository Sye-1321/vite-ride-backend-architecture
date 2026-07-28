import { Logger } from '@nestjs/common';

import { DryRunPushAdapter } from './push/dry-run-push.adapter';
import { DryRunSmsAdapter } from './sms/dry-run-sms.adapter';

describe('dry-run notification adapters', () => {
  it('logs delivery metadata without logging SMS content or recipients', async () => {
    const logger = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);

    const result = await new DryRunSmsAdapter().sendSms({
      to: 'private-recipient',
      message: 'private-message',
      correlationId: 'private-correlation',
    });

    expect(result.outcome).toBe('accepted');
    expect(JSON.stringify(logger.mock.calls)).not.toContain('private-');
    logger.mockRestore();
  });

  it('logs delivery metadata without logging push tokens or content', async () => {
    const logger = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);

    const result = await new DryRunPushAdapter().sendPush({
      tokens: ['private-token'],
      title: 'private-title',
      body: 'private-body',
      correlationId: 'private-correlation',
    });

    expect(result.outcome).toBe('accepted');
    expect(JSON.stringify(logger.mock.calls)).not.toContain('private-');
    logger.mockRestore();
  });
});
