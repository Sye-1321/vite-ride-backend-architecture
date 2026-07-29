import { PolicyDefinition } from './policy-definition.interface';

export function defineStaticPolicies(): PolicyDefinition[] {
  return [
    {
      resource: 'user',
      domain: '*',
      permissions: {
        read: ['system-admin'],
        create: ['system-admin'],
        update: ['system-admin'],
        delete: ['system-admin'],
      },
    },
    {
      resource: 'tenant',
      domain: '*',
      permissions: {
        read: ['super-admin', 'tenant-admin'],
        create: ['super-admin'],
        update: ['super-admin', 'tenant-admin'],
        'manage-members': ['super-admin', 'tenant-admin'],
        'manage-drivers': ['super-admin', 'tenant-admin'],
        'publish-location': ['super-admin', 'tenant-admin', 'driver'],
      },
    },
  ];
}
