import { z } from 'zod';

export const tenantsConfigSchema = z
  .object({
    TENANTS_GRPC_BIND_URL: z.string().default('0.0.0.0:50053'),
    TENANTS_STORE_DRIVER: z.enum(['memory', 'mongodb']).default('memory'),
    DATABASE_URL_TENANTS: z.string().url().optional(),
  })
  .superRefine((config, context) => {
    if (config.TENANTS_STORE_DRIVER === 'mongodb' && !config.DATABASE_URL_TENANTS) {
      context.addIssue({
        code: 'custom',
        path: ['DATABASE_URL_TENANTS'],
        message: 'DATABASE_URL_TENANTS is required for the mongodb store driver',
      });
    }
  });

export type TenantsConfig = z.infer<typeof tenantsConfigSchema>;
