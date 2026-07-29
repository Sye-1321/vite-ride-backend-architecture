import { z } from 'zod';

export const tenantsConfigSchema = z.object({
  TENANTS_GRPC_BIND_URL: z.string().default('0.0.0.0:50053'),
  IDENTITY_GRPC_URL: z.string().default('127.0.0.1:50051'),
  AUTHORIZATION_GRPC_URL: z.string().default('127.0.0.1:50052'),
  DATABASE_URL_TENANTS: z.string().url(),
});

export type TenantsConfig = z.infer<typeof tenantsConfigSchema>;
