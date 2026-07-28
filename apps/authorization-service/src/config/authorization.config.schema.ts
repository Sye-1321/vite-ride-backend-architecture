import { z } from 'zod';

export const authorizationConfigSchema = z
  .object({
    AUTHORIZATION_GRPC_BIND_URL: z.string().default('0.0.0.0:50052'),
    AUTHORIZATION_POLICY_DRIVER: z.enum(['memory', 'mongodb']).default('memory'),
    CASBIN_COLLECTION: z.string().default('casbin'),
    CASBIN_MODEL_PATH: z
      .string()
      .default('apps/authorization-service/src/engines/casbin/rbac_model.conf'),
    DATABASE_URL_AUTHZ: z.string().url().optional(),
    DATABASE_NAME_AUTHZ: z.string().min(1).optional(),
  })
  .superRefine((config, context) => {
    if (config.AUTHORIZATION_POLICY_DRIVER !== 'mongodb') {
      return;
    }

    for (const key of ['DATABASE_URL_AUTHZ', 'DATABASE_NAME_AUTHZ'] as const) {
      if (!config[key]) {
        context.addIssue({
          code: 'custom',
          path: [key],
          message: `${key} is required for the mongodb policy driver`,
        });
      }
    }
  });

export type AuthorizationConfig = z.infer<typeof authorizationConfigSchema>;
