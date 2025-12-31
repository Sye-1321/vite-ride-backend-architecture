import { UserStatus as ProtoStatus } from '@app/proto-schema';
import { ApiUserStatus } from '../dto/enums';

export function mapDomainUserStatusToProto(
  status: ApiUserStatus,
): ProtoStatus {
  switch (status) {
    case ApiUserStatus.PENDING:
      return ProtoStatus.USER_STATUS_PENDING;
    case ApiUserStatus.ACTIVE:
      return ProtoStatus.USER_STATUS_ACTIVE;
    case ApiUserStatus.SUSPENDED:
      return ProtoStatus.USER_STATUS_SUSPENDED;
    case ApiUserStatus.INACTIVE:
      return ProtoStatus.USER_STATUS_DEACTIVATED;
    default:
      throw new Error(`Unsupported API user status: ${status}`);
  }
}
