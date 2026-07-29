import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ApplicationError, requiredText } from '@app/application-core';
import { AuditFactory } from '@app/audit';
import { TYPES } from '@app/shared-kernel';

import { TenantRepositoryPort } from '../../../tenants/application/ports';
import {
  USER_DIRECTORY_PORT,
  UserDirectoryPort,
} from '../../../users/application/user-directory.port';
import { TenantMember } from '../../domain/membership.entity';
import {
  MEMBERSHIP_MUTATION_PORT,
  MembershipMutationPort,
  TenantMemberRepositoryPort,
} from '../ports';
import { AddMemberCommand, RemoveMemberCommand, SuspendMemberCommand } from './membership.commands';

async function existingMember(
  repository: TenantMemberRepositoryPort,
  tenantId: string,
  userId: string,
): Promise<TenantMember> {
  const found = await repository.findByTenantAndUser(
    requiredText(tenantId, 'tenantId'),
    requiredText(userId, 'userId'),
  );
  if (found.isNone()) {
    throw new ApplicationError('NOT_FOUND', 'Tenant member not found');
  }
  return found.unwrap();
}

@CommandHandler(AddMemberCommand)
export class AddMemberHandler implements ICommandHandler<AddMemberCommand> {
  constructor(
    @Inject(TYPES.TenantRepositoryPort)
    private readonly tenants: TenantRepositoryPort,
    @Inject(TYPES.TenantMemberRepositoryPort)
    private readonly members: TenantMemberRepositoryPort,
    @Inject(USER_DIRECTORY_PORT)
    private readonly users: UserDirectoryPort,
    @Inject(MEMBERSHIP_MUTATION_PORT)
    private readonly mutations: MembershipMutationPort,
  ) {}

  async execute(command: AddMemberCommand): Promise<TenantMember> {
    const tenantId = requiredText(command.tenantId, 'tenantId');
    const userId = requiredText(command.userId, 'userId');
    if ((await this.tenants.findById(tenantId)).isNone()) {
      throw new ApplicationError('NOT_FOUND', 'Tenant not found');
    }
    await this.users.assertExists(userId);
    if (await this.members.exists(tenantId, userId, command.role)) {
      throw new ApplicationError('ALREADY_EXISTS', 'Tenant membership already exists');
    }

    const member = TenantMember.create({
      tenantId,
      userId,
      role: command.role,
      audit: AuditFactory.createForCreate(userId),
    });
    await this.mutations.add(member);
    return member;
  }
}

@CommandHandler(SuspendMemberCommand)
export class SuspendMemberHandler implements ICommandHandler<SuspendMemberCommand> {
  constructor(
    @Inject(TYPES.TenantMemberRepositoryPort)
    private readonly members: TenantMemberRepositoryPort,
    @Inject(MEMBERSHIP_MUTATION_PORT)
    private readonly mutations: MembershipMutationPort,
  ) {}

  async execute(command: SuspendMemberCommand): Promise<TenantMember> {
    const member = await existingMember(this.members, command.tenantId, command.userId);
    member.suspend();
    await this.mutations.suspend(member);
    return member;
  }
}

@CommandHandler(RemoveMemberCommand)
export class RemoveMemberHandler implements ICommandHandler<RemoveMemberCommand> {
  constructor(
    @Inject(TYPES.TenantMemberRepositoryPort)
    private readonly members: TenantMemberRepositoryPort,
    @Inject(MEMBERSHIP_MUTATION_PORT)
    private readonly mutations: MembershipMutationPort,
  ) {}

  async execute(command: RemoveMemberCommand): Promise<void> {
    const member = await existingMember(this.members, command.tenantId, command.userId);
    await this.mutations.remove(member);
  }
}

export const MembershipCommandHandlers = [
  AddMemberHandler,
  SuspendMemberHandler,
  RemoveMemberHandler,
];
