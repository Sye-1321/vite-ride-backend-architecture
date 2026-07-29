import { Provider } from '@nestjs/common';
import { newEnforcer, type Enforcer } from 'casbin';
import { ConfigService } from '@nestjs/config';
import { MongoAdapter } from 'casbin-mongodb-adapter';

import { TYPES } from '@app/shared-kernel';

import { AuthorizationConfig } from '../../config';

export const casbinEnforcerProvider: Provider = {
  provide: TYPES.AuthzEnforcerPort,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<Enforcer> => {
    const config = configService.get<AuthorizationConfig>('authorization');

    if (!config) {
      throw new Error('Authorization configuration is unavailable');
    }

    const adapter = await MongoAdapter.newAdapter({
      uri: config.DATABASE_URL_AUTHZ,
      database: config.DATABASE_NAME_AUTHZ,
      collection: config.CASBIN_COLLECTION,
    });

    return newEnforcer(config.CASBIN_MODEL_PATH, adapter);
  },
};
