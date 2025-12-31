import { NestFactory } from '@nestjs/core';
import { TenantsModule } from './tenants.module';

async function bootstrap() {
  const app = await NestFactory.create(TenantsModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
