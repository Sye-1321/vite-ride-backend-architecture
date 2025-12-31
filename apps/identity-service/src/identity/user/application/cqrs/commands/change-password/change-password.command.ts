import { Command, CommandProps } from '@app/shared-kernel';

export class ChangePasswordCommand extends Command {
  readonly userId: string;
  readonly currentPassword: string;
  readonly newPassword: string;

  constructor(props: CommandProps<ChangePasswordCommand>) {
    super(props);
    this.userId = props.userId;
    this.currentPassword = props.currentPassword;
    this.newPassword = props.newPassword;
  }
}
