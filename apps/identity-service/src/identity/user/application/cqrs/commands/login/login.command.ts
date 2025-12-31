import { Command, CommandProps } from "@app/shared-kernel";

export class LoginCommand extends Command {
  readonly phoneNumber: string;
  readonly password: string;

  constructor(props: CommandProps<LoginCommand>) {
    super(props);
    this.phoneNumber = props.phoneNumber;
    this.password = props.password;
  }
}
