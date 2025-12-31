import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserGrpcClient } from '../client/user.grpc.client';
import { GatewayContextModule } from '@app/context';

@Module({
  imports: [
    GatewayContextModule, 
  ],
  controllers: [UserController],
  providers: [UserGrpcClient],
  exports: [UserGrpcClient],
})
export class UserModule {}
