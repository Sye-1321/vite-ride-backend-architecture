import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FirebaseAdapter } from './firebase.adapter';
import firebaseConfig from './config/firebase.config';
import { TYPES } from '@app/shared-kernel';

@Module({
  imports: [
    ConfigModule.forFeature(firebaseConfig),
  ],
  providers: [
    {
      provide: TYPES.PushPort,
      useClass: FirebaseAdapter,
    },
  ],
  exports: [TYPES.PushPort],
})
export class PushModule {}
