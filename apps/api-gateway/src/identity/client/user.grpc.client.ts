import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { from } from 'rxjs';
import { join } from 'path';
import { promisify } from 'util';

import * as grpc from '@grpc/grpc-js';
import { loadPackageDefinition } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';

import {
  LoginRequest,
  LoginResponse,
  RefreshAccessTokenRequest,
  RefreshAccessTokenResponse,
  LogoutRequest,
  RegisterUserRequest,
  RegisterUserResponse,
  VerifyUserRequest,
  ResendVerificationRequest,
  RequestAccountVerificationRequest,
  RequestAccountVerificationResponse,
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

import { GrpcClientContextInterceptor } from '@app/context';

import { GatewayConfig } from '../../config';

@Injectable()
export class UserGrpcClient implements OnModuleInit {
  private svc!: {
    login: (d: LoginRequest) => Promise<LoginResponse>;
    refreshAccessToken: (d: RefreshAccessTokenRequest) => Promise<RefreshAccessTokenResponse>;
    logout: (d: LogoutRequest) => Promise<Empty>;
    registerUser: (d: RegisterUserRequest) => Promise<RegisterUserResponse>;
    verifyUser: (d: VerifyUserRequest) => Promise<Empty>;
    requestAccountVerification: (
      d: RequestAccountVerificationRequest,
    ) => Promise<RequestAccountVerificationResponse>;
    resendVerification: (d: ResendVerificationRequest) => Promise<RegisterUserResponse>;
    changePassword: (d: ChangePasswordRequest) => Promise<Empty>;
    requestPasswordReset: (d: RequestPasswordResetRequest) => Promise<RequestPasswordResetResponse>;
    confirmPasswordReset: (d: ConfirmPasswordResetRequest) => Promise<Empty>;
    requestPhoneNumberChange: (
      d: RequestPhoneNumberChangeRequest,
    ) => Promise<RequestPhoneNumberChangeResponse>;
    confirmPhoneNumberChange: (d: ConfirmPhoneNumberChangeRequest) => Promise<Empty>;
    updateMyProfile: (d: UpdateMyProfileRequest) => Promise<Empty>;
    deactivateUser: (d: DeactivateMyAccountRequest) => Promise<Empty>;
    getMyProfile: (d: GetMyProfileRequest) => Promise<UserResponse>;
    getUserById: (d: GetUserByIdRequest) => Promise<UserResponse>;
    listUsers: (d: ListUsersRequest) => Promise<PaginatedUsersResponse>;
    searchUsers: (d: SearchUsersRequest) => Promise<PaginatedUsersResponse>;
    checkUserExistsByPhone: (
      d: CheckUserExistsByPhoneRequest,
    ) => Promise<CheckUserExistsByPhoneResponse>;
    suspendUser: (d: SuspendUserRequest) => Promise<Empty>;
    unsuspendUser: (d: UnsuspendUserRequest) => Promise<Empty>;
    deleteUser: (d: DeleteUserRequest) => Promise<Empty>;
  };

  constructor(
    private readonly grpcContextInterceptor: GrpcClientContextInterceptor,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const protoPath = join(process.cwd(), 'libs/proto-schema/proto/identity.proto');

    const pkgDef = loadSync(protoPath, {
      keepCase: false,
      longs: String,
      enums: Number,
      defaults: true,
      oneofs: true,
    });

    const grpcPkg: any = loadPackageDefinition(pkgDef);

    const config = this.configService.get<GatewayConfig>('gateway');
    if (!config) {
      throw new Error('Gateway configuration is unavailable');
    }

    const client = new grpcPkg.identity.UserService(
      config.IDENTITY_GRPC_URL,
      grpc.credentials.createInsecure(),
      {
        interceptors: [this.grpcContextInterceptor.interceptor()],
      },
    );

    this.svc = {
      login: promisify(client.login.bind(client)),
      refreshAccessToken: promisify(client.refreshAccessToken.bind(client)),
      logout: promisify(client.logout.bind(client)),

      registerUser: promisify(client.registerUser.bind(client)),
      verifyUser: promisify(client.verifyUser.bind(client)),
      requestAccountVerification: promisify(client.requestAccountVerification.bind(client)),
      resendVerification: promisify(client.resendVerification.bind(client)),

      changePassword: promisify(client.changePassword.bind(client)),
      requestPasswordReset: promisify(client.requestPasswordReset.bind(client)),
      confirmPasswordReset: promisify(client.confirmPasswordReset.bind(client)),

      requestPhoneNumberChange: promisify(client.requestPhoneNumberChange.bind(client)),
      confirmPhoneNumberChange: promisify(client.confirmPhoneNumberChange.bind(client)),

      updateMyProfile: promisify(client.updateMyProfile.bind(client)),
      deactivateUser: promisify(client.deactivateMyAccount.bind(client)),

      getMyProfile: promisify(client.getMyProfile.bind(client)),
      getUserById: promisify(client.getUserById.bind(client)),
      listUsers: promisify(client.listUsers.bind(client)),
      searchUsers: promisify(client.searchUsers.bind(client)),
      checkUserExistsByPhone: promisify(client.checkUserExistsByPhone.bind(client)),

      suspendUser: promisify(client.suspendUser.bind(client)),
      unsuspendUser: promisify(client.unsuspendUser.bind(client)),
      deleteUser: promisify(client.deleteUser.bind(client)),
    };
  }

  login(d: LoginRequest) {
    return from(this.svc.login(d));
  }
  refreshAccessToken(d: RefreshAccessTokenRequest) {
    return from(this.svc.refreshAccessToken(d));
  }
  logout(d: LogoutRequest) {
    return from(this.svc.logout(d));
  }

  registerUser(d: RegisterUserRequest) {
    return from(this.svc.registerUser(d));
  }
  verifyUser(d: VerifyUserRequest) {
    return from(this.svc.verifyUser(d));
  }
  requestAccountVerification(d: RequestAccountVerificationRequest) {
    return from(this.svc.requestAccountVerification(d));
  }
  resendVerification(d: ResendVerificationRequest) {
    return from(this.svc.resendVerification(d));
  }

  changePassword(d: ChangePasswordRequest) {
    return from(this.svc.changePassword(d));
  }
  requestPasswordReset(d: RequestPasswordResetRequest) {
    return from(this.svc.requestPasswordReset(d));
  }
  confirmPasswordReset(d: ConfirmPasswordResetRequest) {
    return from(this.svc.confirmPasswordReset(d));
  }

  requestPhoneNumberChange(d: RequestPhoneNumberChangeRequest) {
    return from(this.svc.requestPhoneNumberChange(d));
  }
  confirmPhoneNumberChange(d: ConfirmPhoneNumberChangeRequest) {
    return from(this.svc.confirmPhoneNumberChange(d));
  }

  updateMyProfile(d: UpdateMyProfileRequest) {
    return from(this.svc.updateMyProfile(d));
  }
  deactivateUser(d: DeactivateMyAccountRequest) {
    return from(this.svc.deactivateUser(d));
  }

  getMyProfile(d: GetMyProfileRequest) {
    return from(this.svc.getMyProfile(d));
  }
  getUserById(d: GetUserByIdRequest) {
    return from(this.svc.getUserById(d));
  }
  listUsers(d: ListUsersRequest) {
    return from(this.svc.listUsers(d));
  }
  searchUsers(d: SearchUsersRequest) {
    return from(this.svc.searchUsers(d));
  }
  checkUserExistsByPhone(d: CheckUserExistsByPhoneRequest) {
    return from(this.svc.checkUserExistsByPhone(d));
  }

  suspendUser(d: SuspendUserRequest) {
    return from(this.svc.suspendUser(d));
  }
  unsuspendUser(d: UnsuspendUserRequest) {
    return from(this.svc.unsuspendUser(d));
  }
  deleteUser(d: DeleteUserRequest) {
    return from(this.svc.deleteUser(d));
  }
}
