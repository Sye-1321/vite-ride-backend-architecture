import { z } from 'zod';

export const casbinSchema = z.object({
  CASBIN_DB_TAG: z.string().default('AUTHZ'),
  CASBIN_COLLECTION: z.string().default('casbin'),
  CASBIN_MODEL_PATH: z
    .string()
    .default('src/engines/casbin/rbac_model.conf'),
});

export type CasbinConfig = z.infer<typeof casbinSchema>;
