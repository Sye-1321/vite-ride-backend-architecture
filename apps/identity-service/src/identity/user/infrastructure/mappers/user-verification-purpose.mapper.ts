import { UserVerificationPurpose as ProtoPurpose } from '@app/proto-schema';

import { UserVerificationPurpose } from '../../application/types';

export function mapProtoPurposeToDomain(purpose: ProtoPurpose): UserVerificationPurpose {
  switch (purpose) {
    case ProtoPurpose.USER_VERIFICATION_ACCOUNT:
      return UserVerificationPurpose.ACCOUNT_VERIFICATION;
    case ProtoPurpose.USER_VERIFICATION_PASSWORD_RESET:
      return UserVerificationPurpose.PASSWORD_RESET;
    case ProtoPurpose.USER_VERIFICATION_PHONE_CHANGE:
      return UserVerificationPurpose.PHONE_NUMBER_CHANGE;
    default:
      throw new Error(`Unsupported verification purpose value: ${purpose}`);
  }
}
