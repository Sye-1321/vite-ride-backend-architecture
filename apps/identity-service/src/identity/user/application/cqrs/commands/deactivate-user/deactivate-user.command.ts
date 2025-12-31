import { Command, CommandProps } from '@app/shared-kernel';

export class DeactivateUserCommand extends Command {
  readonly userId: string;

  constructor(props: CommandProps<DeactivateUserCommand>) {
    super(props);
    this.userId = props.userId;
  }
}