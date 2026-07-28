import { Injectable } from '@nestjs/common';
import { MongoMapper } from '@app/persistence/mongodb/mongo-mapper.interface';
import { AuditMapper } from '@app/audit';

import { Tenant } from '../../../domain/tenant.entity';
import { TenantDataModel } from './tenant.schema';

@Injectable()
export class TenantMapper implements MongoMapper<Tenant, TenantDataModel> {
  toPersistence(entity: Tenant): TenantDataModel {
    const props = entity.getProps();

    return {
      _id: entity.id,
      name: props.name,
      status: props.status,

      ...AuditMapper.toPersistence(props.audit),
    };
  }

  toDomain(doc: TenantDataModel): Tenant {
    return Tenant.rehydrate(
      {
        name: doc.name,
        status: doc.status,
        audit: AuditMapper.toDomain(doc),
      },
      doc._id!,
    );
  }
}
