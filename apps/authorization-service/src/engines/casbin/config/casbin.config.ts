import { registerAs } from '@nestjs/config';
import { casbinSchema, CasbinConfig } from './casbin.config.schema';

export default registerAs('casbin', (): CasbinConfig => {
  return casbinSchema.parse(process.env);
});
