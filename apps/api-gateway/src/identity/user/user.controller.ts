import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';

import { UserGrpcClient } from '../client/user.grpc.client';

import {
  LoginRequestDto,
  RegisterUserRequestDto,
  ChangePasswordRequestDto,
  ConfirmPasswordResetRequestDto,
  ConfirmPhoneChangeRequestDto,
  ResendVerificationOtpRequestDto,
  UpdateMyProfileRequestDto,
  VerifyAccountRequestDto,
  PhoneNumberRequestDto,
  RequestPhoneChangeRequestDto,
  ListUsersQueryDto,
  SearchUsersQueryDto,
} from '../dto';

import { AccessAuthGuard, RefreshAuthGuard, GetCurrentUser, GetCurrentUserId } from '@app/common';

import { mapDomainPurposeToProto } from '../mappers/user-verification-purpose.mapper';
import { mapDomainUserStatusToProto } from '../mappers/user-status.mapper';
import { UserStatus } from '@app/proto-schema';

@Controller('users')
export class UserController {
  constructor(private readonly userGrpc: UserGrpcClient) {}

  @Post('login')
  login(@Body() dto: LoginRequestDto) {
    return this.userGrpc.login(dto);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh-token')
  refreshAccessToken(@GetCurrentUser() user: any) {
    return this.userGrpc.refreshAccessToken({
      userId: user.userId,
      refreshToken: user.token,
    });
  }

  @UseGuards(AccessAuthGuard)
  @Post('logout')
  logout(@GetCurrentUserId() userId: string) {
    return this.userGrpc.logout({ userId });
  }

  @Post('register')
  register(@Body() dto: RegisterUserRequestDto) {
    return this.userGrpc.registerUser(dto);
  }

  @Post('verify')
  verifyAccount(@Body() dto: VerifyAccountRequestDto) {
    return this.userGrpc.verifyUser(dto);
  }

  @Post('resend-verification')
  resendVerification(@Body() dto: ResendVerificationOtpRequestDto) {
    return this.userGrpc.resendVerification({
      verificationToken: dto.verificationToken,
      purpose: mapDomainPurposeToProto(dto.purpose),
    });
  }

  @Post('request-account-verification')
  requestAccountVerification(@Body() dto: PhoneNumberRequestDto) {
    return this.userGrpc.requestAccountVerification(dto);
  }

  @UseGuards(AccessAuthGuard)
  @Post('change-password')
  changePassword(@GetCurrentUserId() userId: string, @Body() dto: ChangePasswordRequestDto) {
    return this.userGrpc.changePassword({
      userId,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
  }

  @Post('request-password-reset')
  requestPasswordReset(@Body() dto: PhoneNumberRequestDto) {
    return this.userGrpc.requestPasswordReset(dto);
  }

  @Post('confirm-password-reset')
  confirmPasswordReset(@Body() dto: ConfirmPasswordResetRequestDto) {
    return this.userGrpc.confirmPasswordReset(dto);
  }

  @UseGuards(AccessAuthGuard)
  @Post('request-phone-change')
  requestPhoneNumberChange(
    @GetCurrentUserId() userId: string,
    @Body() dto: RequestPhoneChangeRequestDto,
  ) {
    return this.userGrpc.requestPhoneNumberChange({
      userId,
      newPhoneNumber: dto.newPhoneNumber,
      currentPassword: dto.currentPassword,
    });
  }

  @UseGuards(AccessAuthGuard)
  @Post('confirm-phone-change')
  confirmPhoneNumberChange(@Body() dto: ConfirmPhoneChangeRequestDto) {
    return this.userGrpc.confirmPhoneNumberChange(dto);
  }

  @UseGuards(AccessAuthGuard)
  @Get('me')
  getMyProfile(@GetCurrentUserId() userId: string) {
    return this.userGrpc.getMyProfile({ userId });
  }

  @UseGuards(AccessAuthGuard)
  @Post('me')
  updateMyProfile(@GetCurrentUserId() userId: string, @Body() dto: UpdateMyProfileRequestDto) {
    return this.userGrpc.updateMyProfile({
      userId,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
  }

  @UseGuards(AccessAuthGuard)
  @Post('deactivate')
  deactivateMyAccount(@GetCurrentUserId() userId: string) {
    return this.userGrpc.deactivateUser({ userId });
  }

  @Get()
  listUsers(@Query() query: ListUsersQueryDto) {
    return this.userGrpc.listUsers({
      pagination: {
        page: query.page ?? 0,
        limit: query.limit ?? 20,
      },
      status: query.status
        ? mapDomainUserStatusToProto(query.status)
        : UserStatus.USER_STATUS_UNSPECIFIED,
      isDeleted: false,
    });
  }

  @Get('search')
  searchUsers(@Query() query: SearchUsersQueryDto) {
    return this.userGrpc.searchUsers({
      pagination: {
        page: query.page ?? 0,
        limit: query.limit ?? 20,
      },
      phoneNumber: query.phoneNumber ?? '',
      name: query.name ?? '',
    });
  }

  @Get(':userId')
  getUserById(@Param('userId') userId: string) {
    return this.userGrpc.getUserById({ userId });
  }

  @Post('exists')
  checkUserExistsByPhone(@Body() dto: PhoneNumberRequestDto) {
    return this.userGrpc.checkUserExistsByPhone(dto);
  }

  @Post(':userId/suspend')
  suspend(@Param('userId') userId: string) {
    return this.userGrpc.suspendUser({ userId });
  }

  @Post(':userId/unsuspend')
  unsuspend(@Param('userId') userId: string) {
    return this.userGrpc.unsuspendUser({ userId });
  }

  @Post(':userId/delete')
  deleteUser(@Param('userId') userId: string) {
    return this.userGrpc.deleteUser({ userId });
  }
}
