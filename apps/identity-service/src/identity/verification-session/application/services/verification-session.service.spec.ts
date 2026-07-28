import { None } from 'oxide.ts';

import { HasherPort, OtpGeneratorPort, TokenGeneratorPort } from '@app/shared-kernel';

import { UserVerificationPurpose } from '../../../user/application/types';
import { VerificationChannel } from '../../domain/verification-session.types';
import { VerificationNotificationPort, VerificationSessionRepositoryPort } from '../ports';
import { VerificationSessionService } from './verification-session.service';

describe('VerificationSessionService', () => {
  let repository: jest.Mocked<VerificationSessionRepositoryPort>;
  let notification: jest.Mocked<VerificationNotificationPort>;
  let service: VerificationSessionService;

  beforeEach(() => {
    repository = {
      insert: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn().mockResolvedValue(None),
      exists: jest.fn().mockResolvedValue(false),
      delete: jest.fn().mockResolvedValue(false),
    };
    notification = {
      sendOtp: jest.fn().mockResolvedValue(undefined),
    };

    const hasher: HasherPort = {
      hash: jest.fn().mockResolvedValue('hashed-otp'),
      compare: jest.fn().mockResolvedValue(true),
    };
    const tokenGenerator: TokenGeneratorPort = {
      generateToken: jest.fn().mockReturnValue('verification-token'),
    };
    const otpGenerator: OtpGeneratorPort = {
      generateOtp: jest.fn().mockReturnValue('123456'),
    };

    service = new VerificationSessionService(
      repository,
      hasher,
      tokenGenerator,
      otpGenerator,
      notification,
    );
  });

  it('persists the hashed session before requesting OTP delivery', async () => {
    const result = await service.requestSession(
      {
        channel: VerificationChannel.SMS,
        phoneNumber: '+251900000000',
      },
      UserVerificationPurpose.ACCOUNT_VERIFICATION,
      { userId: 'user-1' },
    );

    expect(result.isOk()).toBe(true);
    expect(notification.sendOtp).toHaveBeenCalledWith({
      recipient: '+251900000000',
      otp: '123456',
      purpose: UserVerificationPurpose.ACCOUNT_VERIFICATION,
    });
    expect(repository.insert.mock.invocationCallOrder[0]).toBeLessThan(
      notification.sendOtp.mock.invocationCallOrder[0],
    );
  });

  it('returns a delivery error without exposing the OTP', async () => {
    const deliveryError = new Error('notification unavailable');
    notification.sendOtp.mockRejectedValueOnce(deliveryError);

    const result = await service.requestSession(
      {
        channel: VerificationChannel.SMS,
        phoneNumber: '+251900000000',
      },
      UserVerificationPurpose.PASSWORD_RESET,
      { userId: 'user-1' },
    );

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBe(deliveryError);
  });
});
