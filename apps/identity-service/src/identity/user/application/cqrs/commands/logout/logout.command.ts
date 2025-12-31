import { Command, CommandProps } from '@app/shared-kernel';

export class LogoutCommand extends Command {
  readonly userId: string;

  constructor(props: CommandProps<LogoutCommand>) {
    super(props);
    this.userId = props.userId;
  }
}
