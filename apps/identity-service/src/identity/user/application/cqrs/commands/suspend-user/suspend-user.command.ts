import { Command, CommandProps } from '@app/shared-kernel';

export class SuspendUserCommand extends Command {
  readonly userId: string;

  constructor(props: CommandProps<SuspendUserCommand>) {
    super(props);
    this.userId = props.userId;
  }
}
