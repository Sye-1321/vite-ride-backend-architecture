import { App } from 'firebase-admin/app';
import { Messaging } from 'firebase-admin/messaging';

import { LoggerPort } from '@app/shared-kernel';

import { notificationsConfigSchema } from '../../config';
import { FirebaseAdapter } from './firebase.adapter';

describe('FirebaseAdapter', () => {
  const config = notificationsConfigSchema.parse({
    PUSH_DRIVER: 'firebase',
    FIREBASE_PROJECT_ID: 'project',
    FIREBASE_CLIENT_EMAIL: 'service@example.com',
    FIREBASE_PRIVATE_KEY: 'private-key',
  });
  const logger = (): jest.Mocked<LoggerPort> => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    fatal: jest.fn(),
  });

  function firebaseApp(result: { successCount: number; failureCount: number }) {
    const sendEachForMulticast = jest.fn().mockResolvedValue({
      ...result,
      responses: [],
    });
    const deleteApp = jest.fn().mockResolvedValue(undefined);
    const app = {} as App;
    const messaging = { sendEachForMulticast } as unknown as Messaging;

    return { app, deleteApp, messaging, sendEachForMulticast };
  }

  it('reports partial handoff without exposing device tokens', async () => {
    const structuredLogger = logger();
    const { app, deleteApp, messaging, sendEachForMulticast } = firebaseApp({
      successCount: 1,
      failureCount: 1,
    });
    const adapter = new FirebaseAdapter(config, structuredLogger, app, messaging, deleteApp);

    await expect(
      adapter.sendPush({
        tokens: ['private-token-a', 'private-token-b'],
        title: 'Trip update',
        body: 'Your driver is arriving',
      }),
    ).resolves.toMatchObject({ outcome: 'accepted' });

    expect(sendEachForMulticast).toHaveBeenCalledTimes(1);
    expect(structuredLogger.warn).toHaveBeenCalledWith(
      'push provider partially accepted batch',
      expect.objectContaining({ requestedCount: 2, failureCount: 1 }),
      FirebaseAdapter.name,
    );
    expect(JSON.stringify(structuredLogger.warn.mock.calls)).not.toContain('private-token');
  });

  it('maps a total batch failure to unavailable and releases the Firebase app', async () => {
    const structuredLogger = logger();
    const { app, deleteApp, messaging } = firebaseApp({ successCount: 0, failureCount: 2 });
    const adapter = new FirebaseAdapter(config, structuredLogger, app, messaging, deleteApp);

    await expect(
      adapter.sendPush({
        tokens: ['token-a', 'token-b'],
        title: 'Trip update',
        body: 'Your driver is arriving',
      }),
    ).rejects.toMatchObject({
      code: 'UNAVAILABLE',
      message: 'Push provider rejected every recipient',
    });

    await adapter.onApplicationShutdown();
    expect(deleteApp).toHaveBeenCalledTimes(1);
  });
});
