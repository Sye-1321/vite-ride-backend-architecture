import { Command, CommandProps } from '@app/shared-kernel';

export class RefreshAccessTokenCommand extends Command {
  readonly userId: string;
  readonly refreshToken: string;

  constructor(props: CommandProps<RefreshAccessTokenCommand>) {
    super(props);
    this.userId = props.userId;
    this.refreshToken = props.refreshToken;
  }
}
