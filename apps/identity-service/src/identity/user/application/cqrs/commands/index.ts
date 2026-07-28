import { ChangePasswordHandler } from './change-password/change-password.handler';
import { ConfirmPasswordResetHandler } from './confirm-password-reset/confirm-password-reset.handler';
import { ConfirmPhoneNumberChangeHandler } from './confirm-phone-number-change/confirm-phone-number-change.handler';
import { DeactivateUserHandler } from './deactivate-user/deactivate-user.handler';
import { LoginHandler } from './login/login.handler';
import { LogoutHandler } from './logout/logout.handler';
import { RefreshAccessTokenHandler } from './refresh-token/refresh-token.handler';
import { RegisterUserHandler } from './register-user/register-user.handler';
import { RequestPasswordResetHandler } from './request-password-reset/request-password-reset.handler';
import { RequestPhoneNumberChangeHandler } from './request-phone-number-change/request-phone-number-change.handler';
import { ResendVerificationHandler } from './resend-verification-otp/resend-verification-otp.handler';
import { SuspendUserHandler } from './suspend-user/suspend-user.handler';
import { UpdateMyProfileHandler } from './update-my-profile/update-my-profile.handler';
import { VerifyUserHandler } from './verify-user/verify-user.handler';
import { UnsuspendUserHandler } from './unsuspend-user/unsuspend-user.handler';
import { DeleteUserHandler } from './delete-user/delete-user.handler';
import { RequestAccountVerificationHandler } from './request-account-verification/request-account-verification.handler';

export const UserCommandHandlers = [
  // Auth
  LoginHandler,
  LogoutHandler,
  RefreshAccessTokenHandler,

  // Registration & verification
  RegisterUserHandler,
  VerifyUserHandler,
  RequestAccountVerificationHandler,
  ResendVerificationHandler,

  // Password
  ChangePasswordHandler,
  RequestPasswordResetHandler,
  ConfirmPasswordResetHandler,

  // Phone number
  RequestPhoneNumberChangeHandler,
  ConfirmPhoneNumberChangeHandler,

  // Account state
  UpdateMyProfileHandler,
  SuspendUserHandler,
  DeactivateUserHandler,

  //
  UnsuspendUserHandler,
  DeleteUserHandler,
];
