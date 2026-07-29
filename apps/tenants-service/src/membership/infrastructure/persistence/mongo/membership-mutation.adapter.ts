import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model } from 'mongoose';

import { ApplicationError } from '@app/application-core';

import {
  RoleAssignmentOutboxDataModel,
  RoleAssignmentOutboxOperation,
  roleAssignmentOutboxRecord,
} from '../../../../authorization-sync/infrastructure/role-assignment-outbox.schema';
import { MembershipMutationPort } from '../../../application/ports';
import { TenantMember } from '../../../domain/membership.entity';
import { TenantMemberRole } from '../../../domain/membership.types';
import { TenantMemberMapper } from './tenant-member.mapper';
import { TenantMemberDataModel } from './tenant-member.schema';

@Injectable()
export class MongoMembershipMutationAdapter implements MembershipMutationPort {
  constructor(
    @InjectConnection('TenantsConnection')
    private readonly connection: Connection,
    @InjectModel(TenantMemberDataModel.name, 'TenantsConnection')
    private readonly members: Model<TenantMemberDataModel>,
    @InjectModel(RoleAssignmentOutboxDataModel.name, 'TenantsConnection')
    private readonly outbox: Model<RoleAssignmentOutboxDataModel>,
    private readonly mapper: TenantMemberMapper,
  ) {}

  async add(member: TenantMember): Promise<void> {
    member.validate();
    try {
      await this.connection.transaction(async (session) => {
        await this.members.create([this.mapper.toPersistence(member)], { session });
        await this.outbox.create(
          [this.outboxRecord(member, RoleAssignmentOutboxOperation.ASSIGN)],
          {
            session,
          },
        );
      });
    } catch (error) {
      if (this.isDuplicateKey(error)) {
        throw new ApplicationError('ALREADY_EXISTS', 'Tenant membership already exists');
      }
      throw error;
    }
  }

  async suspend(member: TenantMember): Promise<void> {
    member.validate();
    await this.connection.transaction(async (session) => {
      const result = await this.members
        .replaceOne(
          { _id: member.id, isDeleted: { $ne: true } },
          this.mapper.toPersistence(member),
          {
            session,
          },
        )
        .exec();
      if (result.matchedCount !== 1) {
        throw new ApplicationError('NOT_FOUND', 'Tenant member not found');
      }
      await this.enqueueRemoval(member, session);
    });
  }

  async remove(member: TenantMember): Promise<void> {
    member.validate();
    await this.connection.transaction(async (session) => {
      const result = await this.members
        .updateOne(
          { _id: member.id, isDeleted: { $ne: true } },
          { $set: { isDeleted: true, auditDeletedAt: new Date() } },
          { session },
        )
        .exec();
      if (result.modifiedCount !== 1) {
        throw new ApplicationError('NOT_FOUND', 'Tenant member not found');
      }
      await this.enqueueRemoval(member, session);
    });
  }

  private async enqueueRemoval(member: TenantMember, session: ClientSession): Promise<void> {
    const record = this.outboxRecord(member, RoleAssignmentOutboxOperation.REMOVE);
    await this.outbox
      .updateOne(
        { assignmentKey: record.assignmentKey },
        { $setOnInsert: record },
        { upsert: true, session },
      )
      .exec();
  }

  private outboxRecord(
    member: TenantMember,
    operation: RoleAssignmentOutboxOperation,
  ): RoleAssignmentOutboxDataModel {
    return roleAssignmentOutboxRecord({
      membershipId: member.id,
      userId: member.userId,
      domain: member.tenantId,
      role: this.authorizationRole(member),
      operation,
      createdBy: member.userId,
    });
  }

  private authorizationRole(member: TenantMember): string {
    return member.role === TenantMemberRole.ADMIN ? 'tenant-admin' : 'driver';
  }

  private isDuplicateKey(error: unknown): error is { code: number } {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
  }
}
