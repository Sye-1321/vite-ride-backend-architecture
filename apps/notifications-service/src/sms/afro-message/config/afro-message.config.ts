import { registerAs } from '@nestjs/config';
import { afroMessageSchema, AfroMessageConfig } from './afro-message.config.schema';

export default registerAs('afromessage', (): AfroMessageConfig => {
  return afroMessageSchema.parse(process.env);
});
