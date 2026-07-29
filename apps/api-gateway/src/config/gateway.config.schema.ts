import { z } from 'zod';

export const gatewayConfigSchema = z.object({
  GATEWAY_PORT: z.coerce.number().int().positive().max(65535).default(3000),
  GATEWAY_PREFIX: z.string().min(1).default('vite-ride'),
  GATEWAY_ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  GATEWAY_SWAGGER_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  IDENTITY_GRPC_URL: z.string().default('127.0.0.1:50051'),
  AUTHORIZATION_GRPC_URL: z.string().default('127.0.0.1:50052'),
  TENANTS_GRPC_URL: z.string().default('127.0.0.1:50053'),
});

export type GatewayConfig = z.infer<typeof gatewayConfigSchema>;
