import { randomUUID } from 'crypto';
import { Err, Ok, Result } from 'oxide.ts';
import { AggregateRoot, AggregateID } from '@app/shared-kernel';

import {
  VerificationSessionExpiredError,
  VerificationSessionUsedError,
} from './verification-session.error';

import {
  CreateVerificationSessionProps,
  VerificationSessionProps,
  VerificationTarget,
} from './verification-session.types';

export class VerificationSession extends AggregateRoot<VerificationSessionProps> {
  protected readonly _id: AggregateID;

  static createNew(props: CreateVerificationSessionProps): VerificationSession {
    const now = new Date();
    const expiryDurationMs = 5 * 60 * 1000;

    return new VerificationSession({
      id: randomUUID(),
      props: {
        key: props.key,
        target: props.target,
        subjectMeta: props.subjectMeta,
        otpHash: props.otpHash,
        createdAt: now,
        expiresAt: new Date(now.getTime() + expiryDurationMs),
        consumedAt: null,
      },
    });
  }

  static rehydrate(props: VerificationSessionProps): VerificationSession {
    return new VerificationSession({
      id: props.id!,
      props,
    });
  }

  public consume(): Result<void, VerificationSessionExpiredError | VerificationSessionUsedError> {
    if (this.isExpired()) {
      return Err(new VerificationSessionExpiredError());
    }

    if (this.isConsumed()) {
      return Err(new VerificationSessionUsedError());
    }

    this.props.consumedAt = new Date();
    return Ok(undefined);
  }

  private isExpired(): boolean {
    return new Date() >= this.props.expiresAt;
  }

  private isConsumed(): boolean {
    return this.props.consumedAt !== null;
  }

  get subjectMeta(): Record<string, any> {
    return this.props.subjectMeta;
  }

  get otpHash(): string {
    return this.props.otpHash;
  }

  get target(): VerificationTarget {
    return this.props.target;
  }

  public validate(): void {
    if (this.props.expiresAt <= this.props.createdAt) {
      throw new Error('Expiration must be after creation');
    }
  }
}
