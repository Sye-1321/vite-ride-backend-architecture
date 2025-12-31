import { Module } from '@nestjs/common';

import { casbinAdapterProvider } from './casbin-adapter.provider';
import { casbinEnforcerProvider } from './casbin-enforcer.provider';

import { TYPES } from '@app/shared-kernel';

@Module({
  providers: [
    casbinAdapterProvider,
    casbinEnforcerProvider,
  ],
  exports: [
    TYPES.AuthzAdapterPort,
    TYPES.AuthzEnforcerPort,
  ],
})
export class CasbinModule {}
