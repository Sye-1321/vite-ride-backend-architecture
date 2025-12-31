import { Command, CommandProps } from "@app/shared-kernel";

export class RequestPasswordResetCommand extends Command {
  readonly phoneNumber: string;

  constructor(props: CommandProps<RequestPasswordResetCommand>) {
    super(props);
    this.phoneNumber = props.phoneNumber;
  }
}
