import { registerAs } from '@nestjs/config';

import { GatewayConfig, gatewayConfigSchema } from './gateway.config.schema';

export default registerAs('gateway', (): GatewayConfig => gatewayConfigSchema.parse(process.env));
