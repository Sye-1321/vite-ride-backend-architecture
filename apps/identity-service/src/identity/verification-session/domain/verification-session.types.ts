import { VerificationSessionKey } from './verification-session-key.vo';

// EXTEND
export enum VerificationChannel {
  SMS = 'sms',
  // e.g EMAIL = 'email'
}

export interface SmsTarget {
  channel: VerificationChannel.SMS;
  phoneNumber: string;
}

export type VerificationTarget = SmsTarget;

export interface CreateVerificationSessionProps {
  key: VerificationSessionKey;
  target: VerificationTarget;
  otpHash: string;
  subjectMeta: Record<string, any>;
}

export interface VerificationSessionProps {
  id?: string;
  key: VerificationSessionKey;
  target: VerificationTarget;
  subjectMeta: Record<string, any>;
  otpHash: string;
  createdAt: Date;
  expiresAt: Date;
  consumedAt: Date | null;
}
