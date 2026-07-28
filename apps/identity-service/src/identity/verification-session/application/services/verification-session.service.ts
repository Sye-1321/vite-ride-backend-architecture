import { Injectable, Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';

import { VerificationSessionRepositoryPort } from '../ports';

import { VerificationTarget } from '../../domain/verification-session.types';
import { VerificationSessionKey } from '../../domain/verification-session-key.vo';
import { VerificationSession } from '../../domain/verification-session.entity';

import { InvalidOtpError, VerificationSessionNotFoundError } from '../errors';
import {
  VerificationSessionExpiredError,
  VerificationSessionUsedError,
} from '../../domain/verification-session.error';

import { IVerificationSessionService } from './verification-session.service.interface';
import { HasherPort, OtpGeneratorPort, TokenGeneratorPort, TYPES } from '@app/shared-kernel';
import { UserVerificationPurpose } from '../../../user/application/types';

const TOKEN_LENGTH = 32;
const OTP_LENGTH = 6;

@Injectable()
export class VerificationSessionService implements IVerificationSessionService {
  constructor(
    @Inject(TYPES.VerificationSessionRepository)
    private readonly verificationSessionRepository: VerificationSessionRepositoryPort,

    @Inject(TYPES.HasherPort)
    private readonly hasher: HasherPort,

    @Inject(TYPES.TokenGeneratorPort)
    private readonly tokenGenerator: TokenGeneratorPort,

    @Inject(TYPES.OtpGeneratorPort)
    private readonly otpGenerator: OtpGeneratorPort,
  ) {}

  async requestSession(
    target: VerificationTarget,
    purpose: UserVerificationPurpose,
    subjectMeta: Record<string, any>,
  ): Promise<Result<{ verificationToken: string }, Error>> {
    const verificationToken = this.tokenGenerator.generateToken(TOKEN_LENGTH);
    const rawOtp = this.otpGenerator.generateOtp(OTP_LENGTH);
    const otpHash = await this.hasher.hash(rawOtp);

    const key = VerificationSessionKey.create({
      verificationToken,
      purpose,
    });

    const session = VerificationSession.createNew({
      key,
      target,
      otpHash,
      subjectMeta,
    });

    console.log(rawOtp);
    try {
      await this.verificationSessionRepository.insert(session, key);
      return Ok({ verificationToken });
    } catch (error: any) {
      return Err(error);
    }
  }

  async verifySession(
    verificationToken: string,
    purpose: UserVerificationPurpose,
    otp: string,
  ): Promise<
    Result<
      { subjectMeta: Record<string, any> },
      | VerificationSessionNotFoundError
      | VerificationSessionExpiredError
      | VerificationSessionUsedError
      | InvalidOtpError
    >
  > {
    const key = VerificationSessionKey.create({
      verificationToken,
      purpose,
    });

    const result = await this.verificationSessionRepository.findOne(key);
    if (result.isNone()) {
      return Err(new VerificationSessionNotFoundError());
    }

    const session = result.unwrap();
    const otpValid = await this.hasher.compare(otp, session.otpHash);

    if (!otpValid) {
      return Err(new InvalidOtpError());
    }

    const consumeResult = session.consume();
    if (consumeResult.isErr()) {
      return Err(consumeResult.unwrapErr());
    }

    await this.verificationSessionRepository.insert(session, key);

    return Ok({ subjectMeta: session.subjectMeta });
  }

  async resendSession(
    verificationToken: string,
    purpose: UserVerificationPurpose,
  ): Promise<Result<{ verificationToken: string }, VerificationSessionNotFoundError | Error>> {
    const oldKey = VerificationSessionKey.create({
      verificationToken,
      purpose,
    });

    const existingResult = await this.verificationSessionRepository.findOne(oldKey);

    if (existingResult.isNone()) {
      return Err(new VerificationSessionNotFoundError());
    }

    const existingSession = existingResult.unwrap();

    const newVerificationToken = this.tokenGenerator.generateToken(TOKEN_LENGTH);

    const rawOtp = this.otpGenerator.generateOtp(OTP_LENGTH);
    const otpHash = await this.hasher.hash(rawOtp);

    const newKey = VerificationSessionKey.create({
      verificationToken: newVerificationToken,
      purpose,
    });

    const newSession = VerificationSession.createNew({
      key: newKey,
      target: existingSession.target,
      subjectMeta: existingSession.subjectMeta,
      otpHash,
    });

    try {
      await this.verificationSessionRepository.insert(newSession, newKey);
      return Ok({ verificationToken: newVerificationToken });
    } catch (error: any) {
      return Err(error);
    }
  }
}
