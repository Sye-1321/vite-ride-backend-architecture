import { Provider } from '@nestjs/common';
import { newEnforcer, type Enforcer } from 'casbin';
import { ConfigService } from '@nestjs/config';
import { TYPES } from '@app/shared-kernel';

export const casbinEnforcerProvider: Provider = {
  provide: TYPES.AuthzEnforcerPort,
  inject: [TYPES.AuthzAdapterPort, ConfigService],
  useFactory: async (adapter, config: ConfigService): Promise<Enforcer> => {
    const modelPath =
      config.get<string>('casbin.CASBIN_MODEL_PATH', { infer: true }) ||
      'src/engines/casbin/rbac_model.conf';

    return newEnforcer(modelPath, adapter);
  },
};
