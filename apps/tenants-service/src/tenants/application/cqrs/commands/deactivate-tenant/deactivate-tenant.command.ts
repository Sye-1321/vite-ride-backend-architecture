import { Command, CommandProps } from '@app/shared-kernel';

export class DeactivateTenantCommand extends Command {
  readonly tenantId: string;

  constructor(props: CommandProps<DeactivateTenantCommand>) {
    super(props);
    this.tenantId = props.tenantId;
  }
}
