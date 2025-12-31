import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcMethod } from '@nestjs/microservices';
import { Result } from 'oxide.ts';

import {
  LoginRequest,
  LoginResponse,
  RefreshAccessTokenRequest,
  RefreshAccessTokenResponse,
  LogoutRequest,
  RegisterUserRequest,
  RegisterUserResponse,
  VerifyUserRequest,
  RequestAccountVerificationRequest,
  RequestAccountVerificationResponse,
  ResendVerificationRequest,
  ChangePasswordRequest,
  RequestPasswordResetRequest,
  RequestPasswordResetResponse,
  ConfirmPasswordResetRequest,
  RequestPhoneNumberChangeRequest,
  RequestPhoneNumberChangeResponse,
  ConfirmPhoneNumberChangeRequest,
  UpdateMyProfileRequest,
  DeactivateMyAccountRequest,
  GetMyProfileRequest,
  GetUserByIdRequest,
  ListUsersRequest,
  SearchUsersRequest,
  PaginatedUsersResponse,
  CheckUserExistsByPhoneRequest,
  CheckUserExistsByPhoneResponse,
  UserResponse,
  SuspendUserRequest,
  UnsuspendUserRequest,
  DeleteUserRequest,
  Empty,
} from '@app/proto-schema';

import { LoginCommand } from './application/cqrs/commands/login/login.command';
import { RefreshAccessTokenCommand } from './application/cqrs/commands/refresh-token/refresh-token.command';
import { LogoutCommand } from './application/cqrs/commands/logout/logout.command';
import { RegisterUserCommand } from './application/cqrs/commands/register-user/register-user.command';
import { VerifyUserCommand } from './application/cqrs/commands/verify-user/verify-user.command';
import { RequestAccountVerificationCommand } from './application/cqrs/commands/request-account-verification/request-account-verification.command';
import { ResendVerificationCommand } from './application/cqrs/commands/resend-verification-otp/resend-verification-otp.command';
import { ChangePasswordCommand } from './application/cqrs/commands/change-password/change-password.command';
import { RequestPasswordResetCommand } from './application/cqrs/commands/request-password-reset/request-password-reset.command';
import { ConfirmPasswordResetCommand } from './application/cqrs/commands/confirm-password-reset/confirm-password-reset.command';
import { RequestPhoneNumberChangeCommand } from './application/cqrs/commands/request-phone-number-change/request-phone-number-change.command';
import { ConfirmPhoneNumberChangeCommand } from './application/cqrs/commands/confirm-phone-number-change/confirm-phone-number-change.command';
import { UpdateMyProfileCommand } from './application/cqrs/commands/update-my-profile/update-my-profile.command';
import { DeactivateUserCommand } from './application/cqrs/commands/deactivate-user/deactivate-user.command';
import { SuspendUserCommand } from './application/cqrs/commands/suspend-user/suspend-user.command';
import { UnsuspendUserCommand } from './application/cqrs/commands/unsuspend-user/unsuspend-user.command';
import { DeleteUserCommand } from './application/cqrs/commands/delete-user/delete-user.command';

import { GetMyProfileQuery } from './application/cqrs/queries/queries/get-my-profile/get-my-profile.query';
import { GetUserByIdQuery } from './application/cqrs/queries/queries/get-user-by-id/get-user-by-id.query';
import { ListUsersQuery } from './application/cqrs/queries/queries/list-users/list-users.query';
import { SearchUsersQuery } from './application/cqrs/queries/queries/search-users/search-users.query';
import { CheckUserExistsByPhoneQuery } from './application/cqrs/queries/queries/check-user-exists-by-phone/check-user-exists-by-phone.query';

import {
  mapProtoUserStatusToDomain,
} from 'apps/api-gateway/src/identity/mappers';

function unwrapResult<T>(result: Result<T, Error>): T {
  if (result.isErr()) {
    throw result.unwrapErr();
  }
  return result.unwrap();
}

@Controller()
export class UserGrpcController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @GrpcMethod('UserService', 'Login')
  async login(request: LoginRequest): Promise<LoginResponse> {
    return unwrapResult(
      await this.commandBus.execute(new LoginCommand(request)),
    );
  }

  @GrpcMethod('UserService', 'RefreshAccessToken')
  async refreshAccessToken(
    request: RefreshAccessTokenRequest,
  ): Promise<RefreshAccessTokenResponse> {
    return unwrapResult(
      await this.commandBus.execute(
        new RefreshAccessTokenCommand(request),
      ),
    );
  }

  @GrpcMethod('UserService', 'Logout')
  async logout(request: LogoutRequest): Promise<Empty> {
    unwrapResult(
      await this.commandBus.execute(new LogoutCommand(request)),
    );
    return {};
  }

  @GrpcMethod('UserService', 'RegisterUser')
  async registerUser(
    request: RegisterUserRequest,
  ): Promise<RegisterUserResponse> {
    return unwrapResult(
      await this.commandBus.execute(
        new RegisterUserCommand(request),
      ),
    );
  }

  @GrpcMethod('UserService', 'VerifyUser')
  async verifyUser(request: VerifyUserRequest): Promise<Empty> {
    unwrapResult(
      await this.commandBus.execute(
        new VerifyUserCommand(request),
      ),
    );
    return {};
  }

  @GrpcMethod('UserService', 'RequestAccountVerification')
  async requestAccountVerification(
    request: RequestAccountVerificationRequest,
  ): Promise<RequestAccountVerificationResponse> {
    return unwrapResult(
      await this.commandBus.execute(
        new RequestAccountVerificationCommand(request),
      ),
    );
  }

  // @GrpcMethod('UserService', 'ResendVerification')
  // async resendVerification(
  //   request: ResendVerificationRequest,
  // ): Promise<RegisterUserResponse> {
  //   return unwrapResult(
  //     await this.commandBus.execute(
  //       new ResendVerificationCommand({
  //         verificationToken: request.verificationToken,
  //         purpose: mapProtoPurposeToDomain(request.purpose),
  //       }),
  //     ),
  //   );
  // }

  @GrpcMethod('UserService', 'ChangePassword')
  async changePassword(request: ChangePasswordRequest): Promise<Empty> {
    unwrapResult(
      await this.commandBus.execute(
        new ChangePasswordCommand(request),
      ),
    );
    return {};
  }

  @GrpcMethod('UserService', 'RequestPasswordReset')
  async requestPasswordReset(
    request: RequestPasswordResetRequest,
  ): Promise<RequestPasswordResetResponse> {
    return unwrapResult(
      await this.commandBus.execute(
        new RequestPasswordResetCommand(request),
      ),
    );
  }

  @GrpcMethod('UserService', 'ConfirmPasswordReset')
  async confirmPasswordReset(
    request: ConfirmPasswordResetRequest,
  ): Promise<Empty> {
    unwrapResult(
      await this.commandBus.execute(
        new ConfirmPasswordResetCommand(request),
      ),
    );
    return {};
  }

  @GrpcMethod('UserService', 'RequestPhoneNumberChange')
  async requestPhoneNumberChange(
    request: RequestPhoneNumberChangeRequest,
  ): Promise<RequestPhoneNumberChangeResponse> {
    return unwrapResult(
      await this.commandBus.execute(
        new RequestPhoneNumberChangeCommand(request),
      ),
    );
  }

  @GrpcMethod('UserService', 'ConfirmPhoneNumberChange')
  async confirmPhoneNumberChange(
    request: ConfirmPhoneNumberChangeRequest,
  ): Promise<Empty> {
    unwrapResult(
      await this.commandBus.execute(
        new ConfirmPhoneNumberChangeCommand(request),
      ),
    );
    return {};
  }

  @GrpcMethod('UserService', 'UpdateMyProfile')
  async updateMyProfile(
    request: UpdateMyProfileRequest,
  ): Promise<Empty> {
    unwrapResult(
      await this.commandBus.execute(
        new UpdateMyProfileCommand(request),
      ),
    );
    return {};
  }

  @GrpcMethod('UserService', 'DeactivateMyAccount')
  async deactivateMyAccount(
    request: DeactivateMyAccountRequest,
  ): Promise<Empty> {
    unwrapResult(
      await this.commandBus.execute(
        new DeactivateUserCommand(request),
      ),
    );
    return {};
  }

  @GrpcMethod('UserService', 'GetMyProfile')
  async getMyProfile(
    request: GetMyProfileRequest,
  ): Promise<UserResponse> {
    return unwrapResult(
      await this.queryBus.execute(
        new GetMyProfileQuery(request.userId),
      ),
    );
  }

  @GrpcMethod('UserService', 'GetUserById')
  async getUserById(
    request: GetUserByIdRequest,
  ): Promise<UserResponse> {
    return unwrapResult(
      await this.queryBus.execute(
        new GetUserByIdQuery(request.userId),
      ),
    );
  }

  @GrpcMethod('UserService', 'ListUsers')
  async listUsers(
    request: ListUsersRequest,
  ): Promise<PaginatedUsersResponse> {
    return unwrapResult(
      await this.queryBus.execute(
        new ListUsersQuery({
          page: request.pagination?.page,
          limit: request.pagination?.limit,
          status: mapProtoUserStatusToDomain(request.status),
          isDeleted: request.isDeleted,
        }),
      ),
    );
  }

  @GrpcMethod('UserService', 'SearchUsers')
  async searchUsers(
    request: SearchUsersRequest,
  ): Promise<PaginatedUsersResponse> {
    return unwrapResult(
      await this.queryBus.execute(
        new SearchUsersQuery({
          page: request.pagination?.page,
          limit: request.pagination?.limit,
          phoneNumber: request.phoneNumber || undefined,
          name: request.name || undefined,
        }),
      ),
    );
  }

  @GrpcMethod('UserService', 'CheckUserExistsByPhone')
  async checkUserExistsByPhone(
    request: CheckUserExistsByPhoneRequest,
  ): Promise<CheckUserExistsByPhoneResponse> {
    return unwrapResult(
      await this.queryBus.execute(
        new CheckUserExistsByPhoneQuery(request.phoneNumber),
      ),
    );
  }

  @GrpcMethod('UserService', 'SuspendUser')
  async suspendUser(request: SuspendUserRequest): Promise<Empty> {
    unwrapResult(
      await this.commandBus.execute(
        new SuspendUserCommand(request),
      ),
    );
    return {};
  }

  @GrpcMethod('UserService', 'UnsuspendUser')
  async unsuspendUser(
    request: UnsuspendUserRequest,
  ): Promise<Empty> {
    unwrapResult(
      await this.commandBus.execute(
        new UnsuspendUserCommand(request.userId),
      ),
    );
    return {};
  }

  @GrpcMethod('UserService', 'DeleteUser')
  async deleteUser(request: DeleteUserRequest): Promise<Empty> {
    unwrapResult(
      await this.commandBus.execute(
        new DeleteUserCommand(request.userId),
      ),
    );
    return {};
  }
}
