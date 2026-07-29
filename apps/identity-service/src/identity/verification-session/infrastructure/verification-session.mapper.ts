import { Injectable } from '@nestjs/common';
import {
  VerificationSession,
  VerificationSessionKey,
  VerificationSessionKeyProps,
  VerificationTarget,
} from '../domain';

interface VerificationSessionRecord {
  id: string;
  key: VerificationSessionKeyProps;
  target: VerificationTarget;
  subjectMeta: Record<string, unknown>;
  otpHash: string;
  createdAt: string;
  expiresAt: string;
  consumedAt: string | null;
}

@Injectable()
export class VerificationSessionMapper {
  toPersistence(entity: VerificationSession) {
    const props = entity.getProps();

    return {
      id: entity.id,
      key: props.key.unpack(),
      target: props.target,
      subjectMeta: props.subjectMeta,
      otpHash: props.otpHash,
      createdAt: props.createdAt.toISOString(),
      expiresAt: props.expiresAt.toISOString(),
      consumedAt: props.consumedAt ? props.consumedAt.toISOString() : null,
    };
  }

  toDomain(value: unknown): VerificationSession {
    const raw = value as VerificationSessionRecord;
    return VerificationSession.rehydrate({
      id: raw.id,
      key: VerificationSessionKey.rehydrate(raw.key),
      target: raw.target,
      subjectMeta: raw.subjectMeta,
      otpHash: raw.otpHash,
      createdAt: new Date(raw.createdAt),
      expiresAt: new Date(raw.expiresAt),
      consumedAt: raw.consumedAt ? new Date(raw.consumedAt) : null,
    });
  }
}
