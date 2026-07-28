import { z } from 'zod';

export const identityConfigSchema = z.object({
  IDENTITY_GRPC_BIND_URL: z.string().default('0.0.0.0:50051'),
  NOTIFICATIONS_GRPC_URL: z.string().default('127.0.0.1:50054'),
});

export type IdentityConfig = z.infer<typeof identityConfigSchema>;
