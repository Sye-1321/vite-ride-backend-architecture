import { Inject, Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { LoggerPort, TYPES } from '@app/shared-kernel';

import { AuthorizationRoleGrpcAdapter } from './authorization-role.grpc.adapter';
import {
  RoleAssignmentOutboxDataModel,
  RoleAssignmentOutboxStatus,
} from './role-assignment-outbox.schema';

@Injectable()
export class RoleAssignmentOutboxDispatcher
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(
    @InjectModel(RoleAssignmentOutboxDataModel.name, 'TenantsConnection')
    private readonly outbox: Model<RoleAssignmentOutboxDataModel>,
    private readonly authorization: AuthorizationRoleGrpcAdapter,
    @Inject(TYPES.LoggerPort)
    private readonly logger: LoggerPort,
  ) {}

  onApplicationBootstrap(): void {
    this.timer = setInterval(() => void this.dispatch(), 2_000);
    this.timer.unref();
    void this.dispatch();
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private async dispatch(): Promise<void> {
    if (this.running) {
      return;
    }
    this.running = true;
    try {
      const records = await this.outbox
        .find({
          status: RoleAssignmentOutboxStatus.PENDING,
          nextAttemptAt: { $lte: new Date() },
        })
        .sort({ createdAt: 1 })
        .limit(25)
        .exec();

      for (const record of records) {
        await this.deliver(record);
      }
    } catch (error) {
      this.logger.error(
        'authorization outbox dispatch failed',
        error,
        RoleAssignmentOutboxDispatcher.name,
      );
    } finally {
      this.running = false;
    }
  }

  private async deliver(
    record: RoleAssignmentOutboxDataModel & {
      save(): Promise<unknown>;
    },
  ): Promise<void> {
    try {
      await this.authorization.assignRole(record.userId, record.domain, record.role);
      record.status = RoleAssignmentOutboxStatus.PROCESSED;
      record.processedAt = new Date();
      record.lastError = undefined;
    } catch (error) {
      record.attempts += 1;
      record.nextAttemptAt = new Date(Date.now() + Math.min(2 ** record.attempts * 1_000, 60_000));
      record.lastError = error instanceof Error ? error.message.slice(0, 500) : 'Unknown error';
    }
    await record.save();
  }
}
