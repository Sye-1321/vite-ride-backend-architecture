import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MongoDocument } from '@app/persistence';

import { TenantMemberRole, TenantMemberStatus } from '../../../domain/membership.types';

export type TenantMemberDocument = TenantMemberDataModel & Document;

@Schema({ versionKey: false, timestamps: true })
export class TenantMemberDataModel extends MongoDocument {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: Object.values(TenantMemberRole) })
  role: TenantMemberRole;

  @Prop({ required: true, enum: Object.values(TenantMemberStatus) })
  status: TenantMemberStatus;
}

export const TenantMemberSchema = SchemaFactory.createForClass(TenantMemberDataModel);
TenantMemberSchema.index(
  { tenantId: 1, userId: 1, role: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
