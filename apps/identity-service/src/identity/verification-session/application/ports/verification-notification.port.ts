import { UserVerificationPurpose } from '../../../user/application/types';

export interface VerificationNotificationPort {
  sendOtp(params: {
    recipient: string;
    otp: string;
    purpose: UserVerificationPurpose;
  }): Promise<void>;
}
