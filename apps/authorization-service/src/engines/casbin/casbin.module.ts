import { Module } from '@nestjs/common';

import { casbinEnforcerProvider } from './casbin-enforcer.provider';
import { PolicyBootstrapService } from './policy-bootstrap.service';

import { TYPES } from '@app/shared-kernel';

@Module({
  providers: [casbinEnforcerProvider, PolicyBootstrapService],
  exports: [TYPES.AuthzEnforcerPort],
})
export class CasbinModule {}
