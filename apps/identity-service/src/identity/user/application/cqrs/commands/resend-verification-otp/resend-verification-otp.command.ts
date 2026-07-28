import { Command } from '@app/shared-kernel';
import { UserVerificationPurpose } from '../../../types';

export class ResendVerificationCommand extends Command {
  readonly verificationToken: string;
  readonly purpose: UserVerificationPurpose;

  constructor(props: { verificationToken: string; purpose: UserVerificationPurpose }) {
    super(props);
    this.verificationToken = props.verificationToken;
    this.purpose = props.purpose;
  }
}
