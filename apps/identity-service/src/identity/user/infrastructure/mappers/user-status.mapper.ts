import { UserStatus as ProtoUserStatus } from '@app/proto-schema';

import { UserStatus } from '../../domain/user.types';

export function mapProtoUserStatusToDomain(status: ProtoUserStatus): UserStatus {
  switch (status) {
    case ProtoUserStatus.USER_STATUS_PENDING:
      return UserStatus.PENDING;
    case ProtoUserStatus.USER_STATUS_ACTIVE:
      return UserStatus.ACTIVE;
    case ProtoUserStatus.USER_STATUS_SUSPENDED:
      return UserStatus.SUSPENDED;
    case ProtoUserStatus.USER_STATUS_DEACTIVATED:
      return UserStatus.INACTIVE;
    default:
      throw new Error(`Unsupported user status value: ${status}`);
  }
}
