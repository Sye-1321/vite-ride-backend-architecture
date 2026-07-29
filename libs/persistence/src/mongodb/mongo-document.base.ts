import { randomUUID } from 'crypto';
import { Prop } from '@nestjs/mongoose';
import { PersistentEntityProps } from '../core';

export abstract class MongoDocument implements PersistentEntityProps {
  @Prop({ type: String, default: () => randomUUID() })
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
