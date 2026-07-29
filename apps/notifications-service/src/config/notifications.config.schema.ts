import { z } from 'zod';

export const notificationsConfigSchema = z
  .object({
    NOTIFICATIONS_GRPC_BIND_URL: z.string().default('0.0.0.0:50054'),
    SMS_DRIVER: z.enum(['dry-run', 'afromessage']).default('dry-run'),
    PUSH_DRIVER: z.enum(['dry-run', 'firebase']).default('dry-run'),
    NOTIFICATION_PROVIDER_TIMEOUT_MS: z.coerce.number().int().min(500).max(30_000).default(5_000),
    AFROMESSAGE_BASE_URL: z.string().url().default('https://api.afromessage.com/api/send'),
    AFROMESSAGE_API_TOKEN: z.string().min(1).optional(),
    FIREBASE_PROJECT_ID: z.string().min(1).optional(),
    FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
    FIREBASE_PRIVATE_KEY: z.string().min(1).optional(),
  })
  .superRefine((config, context) => {
    if (config.SMS_DRIVER === 'afromessage' && !config.AFROMESSAGE_API_TOKEN) {
      context.addIssue({
        code: 'custom',
        path: ['AFROMESSAGE_API_TOKEN'],
        message: 'AFROMESSAGE_API_TOKEN is required for the afromessage driver',
      });
    }

    if (config.PUSH_DRIVER === 'firebase') {
      const requiredKeys = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY',
      ] as const;

      for (const key of requiredKeys) {
        if (!config[key]) {
          context.addIssue({
            code: 'custom',
            path: [key],
            message: `${key} is required for the firebase driver`,
          });
        }
      }
    }
  });

export type NotificationsConfig = z.infer<typeof notificationsConfigSchema>;
