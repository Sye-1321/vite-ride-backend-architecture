import { readFileSync } from 'fs';
import { join } from 'path';

import { AUTHORIZATION_PACKAGE_NAME, AUTHORIZATION_SERVICE_NAME } from './authorization';
import { NOTIFICATIONS_PACKAGE_NAME, NOTIFICATIONS_SERVICE_NAME } from './notifications';
import { TENANTS_PACKAGE_NAME, TENANTS_SERVICE_NAME } from './tenants';

function readProto(fileName: string): string {
  return readFileSync(join(process.cwd(), 'libs', 'proto-schema', 'proto', fileName), 'utf8');
}

function rpcNames(proto: string): string[] {
  return [...proto.matchAll(/\brpc\s+(\w+)\s*\(/g)].map((match) => match[1]);
}

describe('core service protobuf contracts', () => {
  it('keeps the authorization service name and methods aligned', () => {
    const proto = readProto('authorization.proto');

    expect(proto).toContain(`package ${AUTHORIZATION_PACKAGE_NAME};`);
    expect(proto).toContain(`service ${AUTHORIZATION_SERVICE_NAME}`);
    expect(rpcNames(proto)).toEqual([
      'CheckAccess',
      'AssignRole',
      'RemoveRole',
      'GetRoles',
      'Health',
    ]);
  });

  it('keeps the notifications service name and methods aligned', () => {
    const proto = readProto('notifications.proto');

    expect(proto).toContain(`package ${NOTIFICATIONS_PACKAGE_NAME};`);
    expect(proto).toContain(`service ${NOTIFICATIONS_SERVICE_NAME}`);
    expect(rpcNames(proto)).toEqual(['SendSms', 'SendPush', 'Health']);
  });

  it('keeps the tenants service name and methods aligned', () => {
    const proto = readProto('tenants.proto');

    expect(proto).toContain(`package ${TENANTS_PACKAGE_NAME};`);
    expect(proto).toContain(`service ${TENANTS_SERVICE_NAME}`);
    expect(rpcNames(proto)).toEqual([
      'CreateTenant',
      'GetTenant',
      'ListTenants',
      'UpdateTenant',
      'ChangeTenantStatus',
      'AddMember',
      'SuspendMember',
      'RemoveMember',
      'ListMembers',
      'RegisterDriver',
      'GetDriver',
      'Health',
    ]);
  });
});
