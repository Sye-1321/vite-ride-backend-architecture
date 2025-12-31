import { Injectable } from '@nestjs/common';
import { MongoMapper } from '@app/persistence/mongodb/mongo-mapper.interface';
import { AuditMapper } from '@app/audit';

import { Driver } from '../../../domain/driver.entity';
import { DriverDataModel } from './driver.schema';

@Injectable()
export class DriverMapper
  implements MongoMapper<Driver, DriverDataModel>
{
  toPersistence(entity: Driver): DriverDataModel {
    const props = entity.getProps();

    return {
      _id: entity.id,
      tenantId: props.tenantId,
      userId: props.userId,
      ...AuditMapper.toPersistence(props.audit),
    };
  }

  toDomain(doc: DriverDataModel): Driver {
    return Driver.rehydrate(
      {
        tenantId: doc.tenantId,
        userId: doc.userId,
        audit: AuditMapper.toDomain(doc),
      },
      doc._id!,
    );
  }
}
