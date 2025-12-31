import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MongoDocument } from '@app/persistence';

import { TenantStatus } from '../../../domain/tenant.types';

export type TenantDocument = TenantDataModel & Document;

@Schema({ versionKey: false, timestamps: true })
export class TenantDataModel extends MongoDocument {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop({ type: String, enum: Object.values(TenantStatus), required: true })
  status: TenantStatus;
}

export const TenantSchema = SchemaFactory.createForClass(TenantDataModel);
