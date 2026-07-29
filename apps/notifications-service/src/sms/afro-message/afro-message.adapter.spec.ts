import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';

import { LoggerPort } from '@app/shared-kernel';

import { notificationsConfigSchema } from '../../config';
import { AfroMessageAdapter } from './afro-message.adapter';

describe('AfroMessageAdapter', () => {
  const config = notificationsConfigSchema.parse({
    SMS_DRIVER: 'afromessage',
    AFROMESSAGE_API_TOKEN: 'provider-token',
    NOTIFICATION_PROVIDER_TIMEOUT_MS: 2_500,
  });
  const logger = (): jest.Mocked<LoggerPort> => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    fatal: jest.fn(),
  });

  it('reports provider handoff as accepted and applies bounded HTTP options', async () => {
    const post = jest.fn().mockReturnValue(of({ status: 200 }));
    const adapter = new AfroMessageAdapter({ post } as unknown as HttpService, config, logger());

    await expect(
      adapter.sendSms({
        to: '+251900000000',
        message: 'Trip update',
        correlationId: 'request-1',
      }),
    ).resolves.toMatchObject({ outcome: 'accepted' });

    expect(post).toHaveBeenCalledWith(
      config.AFROMESSAGE_BASE_URL,
      { to: '+251900000000', message: 'Trip update' },
      {
        headers: {
          Authorization: 'Bearer provider-token',
          'X-Correlation-Id': 'request-1',
        },
        maxRedirects: 0,
        timeout: 2_500,
      },
    );
  });

  it('sanitizes provider failures as an unavailable application error', async () => {
    const structuredLogger = logger();
    const post = jest.fn().mockReturnValue(throwError(() => new Error('provider detail')));
    const adapter = new AfroMessageAdapter(
      { post } as unknown as HttpService,
      config,
      structuredLogger,
    );

    await expect(
      adapter.sendSms({ to: '+251900000000', message: 'Trip update' }),
    ).rejects.toMatchObject({
      code: 'UNAVAILABLE',
      message: 'SMS provider is unavailable',
    });
    expect(structuredLogger.error).toHaveBeenCalledWith(
      'SMS provider request failed',
      expect.any(Error),
      AfroMessageAdapter.name,
    );
  });
});
