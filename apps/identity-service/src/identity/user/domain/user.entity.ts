import { randomUUID } from 'crypto';
import { Err, Ok, Result } from 'oxide.ts';
import { AggregateRoot, AggregateID } from '@app/shared-kernel';

import { UserProps, UserStatus } from './user.types';
import {
  UserSuspendedError,
  UserNotVerifiedError,
  PhoneNumberUnchangedError,
  UserAlreadyVerifiedError,
} from './user.errors';
import {  } from '../application/errors';

export class User extends AggregateRoot<UserProps> {
  protected readonly _id: AggregateID;

  static create(props: Omit<UserProps, 'status' | 'refreshTokenHash'>): User {
    return new User({
      id: randomUUID(),
      props: {
        ...props,
        status: UserStatus.PENDING,
        refreshTokenHash: null,
      },
    });
  }

  static rehydrate(props: UserProps, id: AggregateID): User {
    return new User({
      id,
      props,
    });
  }

  public activate(): Result<void, UserAlreadyVerifiedError> {
    if (this.props.status !== UserStatus.PENDING) {
      return Err(new UserAlreadyVerifiedError());
    }
    this.props.status = UserStatus.ACTIVE;
    return Ok(undefined);
  }

  public assertCanResendVerification(): Result<void, UserAlreadyVerifiedError> {
    if (this.props.status !== UserStatus.PENDING) {
        return Err(new UserAlreadyVerifiedError());
      }

    return Ok(undefined);
}

  public suspend(): void {
    this.props.status = UserStatus.SUSPENDED;
    this.invalidateRefreshToken();
  }

  public reactivate(): void {
    if (this.props.status == UserStatus.INACTIVE) {
      this.props.status = UserStatus.ACTIVE;
    }
  }

  public deactivate(): void {
    this.props.status = UserStatus.INACTIVE;
    this.invalidateRefreshToken();
  }

  public assertCanAuthenticate(): Result<
    void,
    UserSuspendedError | UserNotVerifiedError
  > {
    if (this.props.status === UserStatus.SUSPENDED) {
      return Err(new UserSuspendedError());
    }

    if (this.props.status === UserStatus.PENDING) {
      return Err(new UserNotVerifiedError());
    }

    return Ok(undefined);
  }

  public checkPhoneNumberChangePossible(
    newPhoneNumber: string,
  ): Result<void, PhoneNumberUnchangedError> {
    if (newPhoneNumber === this.props.phoneNumber) {
      return Err(new PhoneNumberUnchangedError());
    }

    return Ok(undefined);
  }

  public finalizePhoneNumberChange(newPhoneNumber: string): void {
    this.props.phoneNumber = newPhoneNumber;
  }

  public updatePasswordHash(newPasswordHash: string): void {
    this.props.passwordHash = newPasswordHash;
    this.invalidateRefreshToken();
  }

  public invalidateRefreshToken(): void {
    this.props.refreshTokenHash = null;
  }

  public updateRefreshToken(refreshTokenHash: string): void {
    this.props.refreshTokenHash = refreshTokenHash;
  }

  public updateProfile(
    firstName?: string,
    lastName?: string,
  ): void {
    if (firstName !== undefined) {
      this.props.firstName = firstName;
    }

    if (lastName !== undefined) {
      this.props.lastName = lastName;
    }
  }


  get refreshTokenHash(): string | null {
    return this.props.refreshTokenHash;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get phoneNumber(): string {
    return this.props.phoneNumber;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get firstName() { return this.props.firstName }
  get lastName() { return this.props.lastName }
  get audit() { return this.props.audit }


  public updateAudit(audit: UserProps['audit']): void {
    this.props.audit = audit;
  }

  public validate(): void {
    if (!this.props.phoneNumber) throw new Error('Phone number is required');
    if (!this.props.passwordHash) throw new Error('Password hash is required');
  }
}
