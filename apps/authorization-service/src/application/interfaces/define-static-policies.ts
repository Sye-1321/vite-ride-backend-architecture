import { PolicyDefinition } from './policy-definition.interface';

export function defineStaticPolicies(): PolicyDefinition[] {
  return [
    {
      resource: 'user',
      domain: '*',
      permissions: {
        read: ['user'],
        create: ['user'],
        update: ['user'],
        delete: ['user'],
      },
    },
    {
      resource: 'tenant',
      domain: '*',
      permissions: {
        read: ['super-admin'],
        create: ['super-admin'],
      },
    },
  ];
}
