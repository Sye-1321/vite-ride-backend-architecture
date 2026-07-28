import { z } from 'zod';

export const gatewayConfigSchema = z.object({
  GATEWAY_PORT: z.coerce.number().int().positive().max(65535).default(3000),
  GATEWAY_PREFIX: z.string().min(1).default('vite-ride'),
  IDENTITY_GRPC_URL: z.string().default('127.0.0.1:50051'),
  AUTHORIZATION_GRPC_URL: z.string().default('127.0.0.1:50052'),
  TENANTS_GRPC_URL: z.string().default('127.0.0.1:50053'),
});

export type GatewayConfig = z.infer<typeof gatewayConfigSchema>;
