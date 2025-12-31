import { Command, CommandProps } from "@app/shared-kernel";

export class VerifyUserCommand extends Command {
  readonly otp: string;
  readonly verificationToken: string;
  constructor(props: CommandProps<VerifyUserCommand>) {
    super(props);
    this.otp = props.otp;
    this.verificationToken = props.verificationToken;
  }
}
