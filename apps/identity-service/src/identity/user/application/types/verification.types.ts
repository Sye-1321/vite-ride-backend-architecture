export interface VerificationSessionMetadata {
  userId: string;
  newPhoneNumber?: string;
}

export enum UserVerificationPurpose {
  ACCOUNT_VERIFICATION = 'account-verification',
  PASSWORD_RESET = 'password-reset',
  PHONE_NUMBER_CHANGE = 'phone-number-change',
}
