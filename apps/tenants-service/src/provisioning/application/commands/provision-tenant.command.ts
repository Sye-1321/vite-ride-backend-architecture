export class ProvisionTenantCommand {
  constructor(
    public readonly name: string,
    public readonly ownerUserId: string,
  ) {}
}
