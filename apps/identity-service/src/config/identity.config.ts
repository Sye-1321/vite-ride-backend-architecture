import { registerAs } from '@nestjs/config';

import { IdentityConfig, identityConfigSchema } from './identity.config.schema';

export default registerAs('identity', (): IdentityConfig => {
  return identityConfigSchema.parse(process.env);
});
