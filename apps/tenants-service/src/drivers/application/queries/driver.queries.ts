export class GetDriverQuery {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
  ) {}
}
