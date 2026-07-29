import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { MongoDocument } from '@app/persistence';

export enum RoleAssignmentOutboxStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
}

export enum RoleAssignmentOutboxOperation {
  ASSIGN = 'ASSIGN',
  REMOVE = 'REMOVE',
}

@Schema({ versionKey: false, timestamps: true })
export class RoleAssignmentOutboxDataModel extends MongoDocument {
  @Prop({ required: true, unique: true, index: true })
  assignmentKey: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  domain: string;

  @Prop({ required: true })
  role: string;

  @Prop({
    required: true,
    enum: Object.values(RoleAssignmentOutboxOperation),
    default: RoleAssignmentOutboxOperation.ASSIGN,
  })
  operation: RoleAssignmentOutboxOperation;

  @Prop({
    required: true,
    enum: Object.values(RoleAssignmentOutboxStatus),
    default: RoleAssignmentOutboxStatus.PENDING,
    index: true,
  })
  status: RoleAssignmentOutboxStatus;

  @Prop({ required: true, default: 0 })
  attempts: number;

  @Prop({ type: Date, required: true, default: Date.now, index: true })
  nextAttemptAt: Date;

  @Prop()
  lastError?: string;

  @Prop({ type: Date })
  processedAt?: Date;
}

export const RoleAssignmentOutboxSchema = SchemaFactory.createForClass(
  RoleAssignmentOutboxDataModel,
);
RoleAssignmentOutboxSchema.index({ status: 1, nextAttemptAt: 1 });

export function roleAssignmentOutboxRecord(input: {
  membershipId: string;
  userId: string;
  domain: string;
  role: string;
  operation?: RoleAssignmentOutboxOperation;
  createdBy: string;
}): RoleAssignmentOutboxDataModel {
  const now = new Date();
  const operation = input.operation ?? RoleAssignmentOutboxOperation.ASSIGN;
  return {
    assignmentKey: `${input.membershipId}:${operation}`,
    userId: input.userId,
    domain: input.domain,
    role: input.role,
    operation,
    status: RoleAssignmentOutboxStatus.PENDING,
    attempts: 0,
    nextAttemptAt: now,
    auditCreatedAt: now.toISOString(),
    auditCreatedBy: input.createdBy,
    isDeleted: false,
  };
}
