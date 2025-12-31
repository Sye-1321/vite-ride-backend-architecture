import { Command, CommandProps } from '@app/shared-kernel';

export class ActivateTenantCommand extends Command {
  readonly tenantId: string;

  constructor(props: CommandProps<ActivateTenantCommand>) {
    super(props);
    this.tenantId = props.tenantId;
  }
}
