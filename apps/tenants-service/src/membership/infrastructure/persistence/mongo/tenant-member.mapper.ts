import { Injectable } from '@nestjs/common';
import { MongoMapper } from '@app/persistence/mongodb/mongo-mapper.interface';
import { AuditMapper } from '@app/audit';

import { TenantMember } from '../../../domain/membership.entity';
import { TenantMemberDataModel } from './tenant-member.schema';

@Injectable()
export class TenantMemberMapper implements MongoMapper<TenantMember, TenantMemberDataModel> {
  toPersistence(entity: TenantMember): TenantMemberDataModel {
    const props = entity.getProps();

    return {
      _id: entity.id,
      tenantId: props.tenantId,
      userId: props.userId,
      role: props.role,
      status: props.status,
      ...AuditMapper.toPersistence(props.audit),
    };
  }

  toDomain(doc: TenantMemberDataModel): TenantMember {
    return TenantMember.rehydrate(
      {
        tenantId: doc.tenantId,
        userId: doc.userId,
        role: doc.role,
        status: doc.status,
        audit: AuditMapper.toDomain(doc),
      },
      doc._id!,
    );
  }
}
