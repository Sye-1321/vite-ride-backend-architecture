import { Prop } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { PersistentEntityProps } from '../core';

export abstract class MongoDocument implements PersistentEntityProps {
  @Prop({ type: String, default: () => uuidv4() })
  _id?: string;

  @Prop({ type: String, required: true, immutable: true })
  auditCreatedAt!: string;

  @Prop({ type: String, required: true, immutable: true })
  auditCreatedBy!: string;

  @Prop({ type: String })
  auditUpdatedAt?: string;

  @Prop({ type: String })
  auditUpdatedBy?: string;

  @Prop({ type: String })
  auditDeletedAt?: string;

  @Prop({ type: String })
  auditDeletedBy?: string;

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;
}
