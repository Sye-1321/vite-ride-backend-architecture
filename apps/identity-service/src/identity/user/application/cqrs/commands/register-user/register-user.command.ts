import { Command, CommandProps } from '@app/shared-kernel';

export class RegisterUserCommand extends Command {
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly password: string;

  constructor(props: CommandProps<RegisterUserCommand>) {
    super(props);
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.phoneNumber = props.phoneNumber;
    this.password = props.password;
  }
}
