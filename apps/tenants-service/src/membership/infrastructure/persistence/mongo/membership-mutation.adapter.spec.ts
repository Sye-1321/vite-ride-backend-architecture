import { ClientSession, Connection, Model } from 'mongoose';

import { AuditFactory } from '@app/audit';

import {
  RoleAssignmentOutboxDataModel,
  RoleAssignmentOutboxOperation,
} from '../../../../authorization-sync/infrastructure/role-assignment-outbox.schema';
import { TenantMember } from '../../../domain/membership.entity';
import { TenantMemberRole } from '../../../domain/membership.types';
import { MongoMembershipMutationAdapter } from './membership-mutation.adapter';
import { TenantMemberMapper } from './tenant-member.mapper';
import { TenantMemberDataModel } from './tenant-member.schema';

describe('MongoMembershipMutationAdapter', () => {
  const session = {} as ClientSession;
  const member = () =>
    TenantMember.create({
      tenantId: 'tenant-1',
      userId: 'user-1',
      role: TenantMemberRole.ADMIN,
      audit: AuditFactory.createForCreate('operator-1'),
    });

  function setup() {
    const transaction = jest.fn(async (work: (activeSession: ClientSession) => Promise<void>) =>
      work(session),
    );
    const members = {
      create: jest.fn().mockResolvedValue(undefined),
      replaceOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ matchedCount: 1 }),
      }),
      updateOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      }),
    };
    const outbox = {
      create: jest.fn().mockResolvedValue(undefined),
      updateOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ upsertedCount: 1 }),
      }),
    };
    const adapter = new MongoMembershipMutationAdapter(
      { transaction } as unknown as Connection,
      members as unknown as Model<TenantMemberDataModel>,
      outbox as unknown as Model<RoleAssignmentOutboxDataModel>,
      new TenantMemberMapper(),
    );

    return { adapter, members, outbox, transaction };
  }

  it('persists a membership and assignment event in one transaction', async () => {
    const { adapter, members, outbox, transaction } = setup();
    const tenantMember = member();

    await adapter.add(tenantMember);

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(members.create).toHaveBeenCalledWith(
      [expect.objectContaining({ _id: tenantMember.id })],
      {
        session,
      },
    );
    expect(outbox.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          assignmentKey: `${tenantMember.id}:ASSIGN`,
          operation: RoleAssignmentOutboxOperation.ASSIGN,
          role: 'tenant-admin',
        }),
      ],
      { session },
    );
  });

  it('uses one idempotent removal event for suspension and deletion', async () => {
    const { adapter, outbox, transaction } = setup();
    const tenantMember = member();
    tenantMember.suspend();

    await adapter.suspend(tenantMember);
    await adapter.remove(tenantMember);

    expect(transaction).toHaveBeenCalledTimes(2);
    expect(outbox.updateOne).toHaveBeenCalledTimes(2);
    for (const [filter, update, options] of outbox.updateOne.mock.calls) {
      expect(filter).toEqual({ assignmentKey: `${tenantMember.id}:REMOVE` });
      expect(update).toEqual({
        $setOnInsert: expect.objectContaining({
          operation: RoleAssignmentOutboxOperation.REMOVE,
          role: 'tenant-admin',
        }),
      });
      expect(options).toEqual({ upsert: true, session });
    }
  });
});
