import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MongoDocument } from '@app/persistence';

export type DriverDocument = DriverDataModel & Document;

@Schema({ versionKey: false, timestamps: true })
export class DriverDataModel extends MongoDocument {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  userId: string;
}

export const DriverSchema =
  SchemaFactory.createForClass(DriverDataModel);

DriverSchema.index(
  { tenantId: 1, userId: 1 },
  { unique: true },
);
