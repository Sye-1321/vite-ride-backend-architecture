import { Command, CommandProps } from '@app/shared-kernel';

export class ConfirmPhoneNumberChangeCommand extends Command {
  readonly otp: string;
  readonly verificationToken: string;

  constructor(props: CommandProps<ConfirmPhoneNumberChangeCommand>) {
    super(props);
    this.otp = props.otp;
    this.verificationToken = props.verificationToken;
  }
}
