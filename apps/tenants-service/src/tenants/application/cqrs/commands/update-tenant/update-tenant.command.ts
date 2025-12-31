import { Command, CommandProps } from '@app/shared-kernel';

export class UpdateTenantCommand extends Command {
  readonly tenantId: string;
  readonly name: string;

  constructor(props: CommandProps<UpdateTenantCommand>) {
    super(props);
    this.tenantId = props.tenantId;
    this.name = props.name;
  }
}
