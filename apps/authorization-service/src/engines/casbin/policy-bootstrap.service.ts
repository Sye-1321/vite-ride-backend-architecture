import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { Enforcer } from 'casbin';

import { LoggerPort, TYPES } from '@app/shared-kernel';

import { defineStaticPolicies } from '../../application/interfaces';

@Injectable()
export class PolicyBootstrapService implements OnModuleInit {
  constructor(
    @Inject(TYPES.AuthzEnforcerPort)
    private readonly enforcer: Enforcer,
    @Inject(TYPES.LoggerPort)
    private readonly logger: LoggerPort,
  ) {}

  async onModuleInit(): Promise<void> {
    const policies = defineStaticPolicies();

    for (const policy of policies) {
      for (const [action, roles] of Object.entries(policy.permissions)) {
        for (const role of roles ?? []) {
          const exists = await this.enforcer.hasPolicy(role, policy.resource, action);

          if (!exists) {
            await this.enforcer.addPolicy(role, policy.resource, action);
            this.logger.log(
              'authorization policy added',
              { role, resource: policy.resource, action },
              PolicyBootstrapService.name,
            );
          }
        }
      }
    }
  }
}
