import { Command, CommandProps } from '@app/shared-kernel';

export class ConfirmPasswordResetCommand extends Command {
  readonly newPassword: string;
  readonly otp: string;
  readonly verificationToken: string;

  constructor(props: CommandProps<ConfirmPasswordResetCommand>) {
    super(props);
    this.newPassword = props.newPassword;
    this.otp = props.otp;
    this.verificationToken = props.verificationToken;
  }
}
