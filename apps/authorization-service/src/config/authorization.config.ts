import { registerAs } from '@nestjs/config';

import { AuthorizationConfig, authorizationConfigSchema } from './authorization.config.schema';

export default registerAs(
  'authorization',
  (): AuthorizationConfig => authorizationConfigSchema.parse(process.env),
);
