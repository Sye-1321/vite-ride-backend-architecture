import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { from } from 'rxjs';

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
  IDENTITY_PACKAGE_NAME,
  USER_SERVICE_NAME,
} from '@app/proto-schema';

import { GrpcClientContextInterceptor } from '@app/context';

import { GatewayConfig } from '../../config';
import { createGrpcUnaryClient, GrpcClientLifecycle } from '../../grpc/grpc-unary-client.factory';

@Injectable()
export class UserGrpcClient implements OnModuleInit, OnApplicationShutdown {
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
    deactivateMyAccount: (d: DeactivateMyAccountRequest) => Promise<Empty>;
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
  } & GrpcClientLifecycle;

  constructor(
    private readonly grpcContextInterceptor: GrpcClientContextInterceptor,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const config = this.configService.get<GatewayConfig>('gateway');
    if (!config) {
      throw new Error('Gateway configuration is unavailable');
    }

    this.svc = createGrpcUnaryClient<typeof this.svc>({
      packageName: IDENTITY_PACKAGE_NAME,
      serviceName: USER_SERVICE_NAME,
      protoFile: 'identity.proto',
      url: config.IDENTITY_GRPC_URL,
      methods: [
        'login',
        'refreshAccessToken',
        'logout',
        'registerUser',
        'verifyUser',
        'requestAccountVerification',
        'resendVerification',
        'changePassword',
        'requestPasswordReset',
        'confirmPasswordReset',
        'requestPhoneNumberChange',
        'confirmPhoneNumberChange',
        'updateMyProfile',
        'deactivateMyAccount',
        'getMyProfile',
        'getUserById',
        'listUsers',
        'searchUsers',
        'checkUserExistsByPhone',
        'suspendUser',
        'unsuspendUser',
        'deleteUser',
      ],
      contextInterceptor: this.grpcContextInterceptor,
    });
  }

  onApplicationShutdown(): void {
    this.svc?.close();
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
    return from(this.svc.deactivateMyAccount(d));
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
