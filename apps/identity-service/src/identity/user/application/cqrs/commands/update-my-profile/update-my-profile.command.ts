import { Command, CommandProps } from '@app/shared-kernel';

export class UpdateMyProfileCommand extends Command {
  readonly userId: string;
  readonly firstName?: string;
  readonly lastName?: string;

  constructor(props: CommandProps<UpdateMyProfileCommand>) {
    super(props);
    this.userId = props.userId;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
  }
}
