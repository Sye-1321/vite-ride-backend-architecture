import { Command, CommandProps } from '@app/shared-kernel';

export class SuspendTenantCommand extends Command {
  readonly tenantId: string;

  constructor(props: CommandProps<SuspendTenantCommand>) {
    super(props);
    this.tenantId = props.tenantId;
  }
}
