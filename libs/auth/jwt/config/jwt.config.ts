import { registerAs } from '@nestjs/config';
import { jwtSchema, JwtConfig } from './jwt.config.schema';

export default registerAs('jwt', (): JwtConfig => {
  return jwtSchema.parse(process.env);
});
