import { z } from 'zod';

export const authorizationConfigSchema = z.object({
  AUTHORIZATION_GRPC_BIND_URL: z.string().default('0.0.0.0:50052'),
  CASBIN_COLLECTION: z.string().default('casbin'),
  CASBIN_MODEL_PATH: z
    .string()
    .default('apps/authorization-service/src/engines/casbin/rbac_model.conf'),
  DATABASE_URL_AUTHZ: z.string().url(),
  DATABASE_NAME_AUTHZ: z.string().min(1),
});

export type AuthorizationConfig = z.infer<typeof authorizationConfigSchema>;
