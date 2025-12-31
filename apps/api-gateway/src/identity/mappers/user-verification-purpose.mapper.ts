import {
  UserVerificationPurpose as ProtoPurpose,
} from '@app/proto-schema';
import { ApiUserVerificationPurpose } from '../dto/enums';

export function mapDomainPurposeToProto(
  purpose: ApiUserVerificationPurpose,
): ProtoPurpose {
  switch (purpose) {
    case ApiUserVerificationPurpose.ACCOUNT_VERIFICATION:
      return ProtoPurpose.USER_VERIFICATION_ACCOUNT;

    case ApiUserVerificationPurpose.PASSWORD_RESET:
      return ProtoPurpose.USER_VERIFICATION_PASSWORD_RESET;

    case ApiUserVerificationPurpose.PHONE_NUMBER_CHANGE:
      return ProtoPurpose.USER_VERIFICATION_PHONE_CHANGE;

    default:
      throw new Error(`Unsupported API verification purpose: ${purpose}`);
  }
}
