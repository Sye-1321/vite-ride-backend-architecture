import { registerAs } from '@nestjs/config';

import { NotificationsConfig, notificationsConfigSchema } from './notifications.config.schema';

export default registerAs('notifications', (): NotificationsConfig => {
  return notificationsConfigSchema.parse(process.env);
});
