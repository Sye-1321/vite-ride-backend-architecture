import { NestFactory } from '@nestjs/core';
import { DispatchMatchingServiceModule } from './dispatch-matching-service.module';

async function bootstrap() {
  const app = await NestFactory.create(DispatchMatchingServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
