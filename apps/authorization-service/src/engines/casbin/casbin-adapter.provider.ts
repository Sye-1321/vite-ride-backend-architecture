import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoAdapter } from 'casbin-mongodb-adapter';

import { TYPES } from '@app/shared-kernel';

export const casbinAdapterProvider: Provider = {
  provide: TYPES.AuthzAdapterPort,
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const dbTag =
      config.get<string>('casbin.CASBIN_DB_TAG', { infer: true }) ?? 'AUTHZ';

    const uri = config.get<string>(`DATABASE_URL_${dbTag}`);
    const database = config.get<string>(`DATABASE_NAME_${dbTag}`);

    if (!uri || !database) {
      throw new Error(
        `DATABASE_URL_${dbTag} or DATABASE_NAME_${dbTag} not defined`,
      );
    }

    const collection =
      config.get<string>('casbin.CASBIN_COLLECTION', { infer: true }) ||
      'casbin';

    return MongoAdapter.newAdapter({
      uri,
      database,
      collection,
    });
  },
};
