import { Command, CommandProps } from '@app/shared-kernel';

export class CreateTenantCommand extends Command {
  readonly name: string;

  constructor(props: CommandProps<CreateTenantCommand>) {
    super(props);
    this.name = props.name;
  }
}
