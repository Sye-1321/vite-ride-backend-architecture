import { NestFactory } from '@nestjs/core';
import { NotificationsModule } from './notifications.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsModule);

  const port = 3000;
  await app.listen(port);

  console.log(`Notifications service running on http://localhost:${port}`);
}

bootstrap();
