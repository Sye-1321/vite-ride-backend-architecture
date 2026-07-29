import { z } from 'zod';

export const tenantsConfigSchema = z.object({
  TENANTS_GRPC_BIND_URL: z.string().default('0.0.0.0:50053'),
  DATABASE_URL_TENANTS: z.string().url(),
});

export type TenantsConfig = z.infer<typeof tenantsConfigSchema>;
