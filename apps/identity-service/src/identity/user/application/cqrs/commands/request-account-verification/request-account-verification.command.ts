import { Command, CommandProps } from '@app/shared-kernel';

export class RequestAccountVerificationCommand extends Command {
  readonly phoneNumber: string;

  constructor(props: CommandProps<RequestAccountVerificationCommand>) {
    super(props);
    this.phoneNumber = props.phoneNumber;
  }
}
