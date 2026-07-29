import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserGrpcClient } from '../client/user.grpc.client';
import { GatewayContextModule } from '@app/context';
import { AuthorizationModule } from '../../authorization/authorization.module';

@Module({
  imports: [GatewayContextModule, AuthorizationModule],
  controllers: [UserController],
  providers: [UserGrpcClient],
  exports: [UserGrpcClient],
})
export class UserModule {}
