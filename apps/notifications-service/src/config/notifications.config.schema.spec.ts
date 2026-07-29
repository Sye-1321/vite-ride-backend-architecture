import { notificationsConfigSchema } from './notifications.config.schema';

describe('notificationsConfigSchema', () => {
  it('uses local-safe drivers without requiring provider credentials', () => {
    const config = notificationsConfigSchema.parse({});

    expect(config).toMatchObject({
      NOTIFICATIONS_GRPC_BIND_URL: '0.0.0.0:50054',
      SMS_DRIVER: 'dry-run',
      PUSH_DRIVER: 'dry-run',
      NOTIFICATION_PROVIDER_TIMEOUT_MS: 5_000,
    });
  });

  it('requires an API token when the SMS provider is enabled', () => {
    const result = notificationsConfigSchema.safeParse({
      SMS_DRIVER: 'afromessage',
    });

    expect(result.success).toBe(false);
  });

  it('requires every Firebase credential when push delivery is enabled', () => {
    const result = notificationsConfigSchema.safeParse({
      PUSH_DRIVER: 'firebase',
      FIREBASE_PROJECT_ID: 'project',
    });

    expect(result.success).toBe(false);
  });
});
