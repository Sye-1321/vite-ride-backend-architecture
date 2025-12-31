export interface PolicyDefinition {
  resource: string;
  domain: string;
  permissions: {
    read?: string[];
    create?: string[];
    update?: string[];
    delete?: string[];
  };
}
