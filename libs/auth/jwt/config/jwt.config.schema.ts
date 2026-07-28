import { z } from 'zod';

export const jwtSchema = z.object({
  JWT_ACCESS_TOKEN_SECRET: z.string().nonempty(),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: z.string().nonempty(),
  JWT_REFRESH_TOKEN_SECRET: z.string().nonempty(),
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: z.string().nonempty(),
});

export type JwtConfig = z.infer<typeof jwtSchema>;
