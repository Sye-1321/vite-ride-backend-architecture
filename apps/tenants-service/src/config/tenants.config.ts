import { registerAs } from '@nestjs/config';

import { TenantsConfig, tenantsConfigSchema } from './tenants.config.schema';

export default registerAs('tenants', (): TenantsConfig => tenantsConfigSchema.parse(process.env));
