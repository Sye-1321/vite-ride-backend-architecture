export interface PolicyDefinition {
  resource: string;
  domain: string;
  permissions: Record<string, string[] | undefined>;
}
