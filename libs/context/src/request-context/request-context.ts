export class RequestContext {
  constructor(
    public readonly correlationId: string,
    public readonly phoneNumber: string,
    public readonly tenantId?: string,
    public readonly userId?: string,
  ) {
    Object.freeze(this);
  }
}
