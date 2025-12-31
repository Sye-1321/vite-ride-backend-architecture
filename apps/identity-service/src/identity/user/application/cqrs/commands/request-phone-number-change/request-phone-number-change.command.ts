import { Command, CommandProps } from '@app/shared-kernel';

export class RequestPhoneNumberChangeCommand extends Command {
  readonly userId: string;
  readonly newPhoneNumber: string;
  readonly currentPassword: string;

  constructor(props: CommandProps<RequestPhoneNumberChangeCommand>) {
    super(props);
    this.userId = props.userId;
    this.newPhoneNumber = props.newPhoneNumber;
    this.currentPassword = props.currentPassword;
  }
}
