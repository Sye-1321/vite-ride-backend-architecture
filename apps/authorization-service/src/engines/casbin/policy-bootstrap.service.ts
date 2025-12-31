import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import type { Enforcer } from 'casbin'
import { defineStaticPolicies } from '../../application/interfaces';
import { TYPES } from '@app/shared-kernel';

@Injectable()
export class PolicyBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(PolicyBootstrapService.name);

  constructor(
    @Inject(TYPES.AuthzEnforcerPort)
    private readonly enforcer: Enforcer,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.syncStaticPolicies();
  }

  private async syncStaticPolicies(): Promise<void> {
    const policies = defineStaticPolicies();

    for (const policy of policies) {
      for (const [action, roles] of Object.entries(policy.permissions)) {
        for (const role of roles ?? []) {
          const exists = await this.enforcer.hasPolicy(
            role,
            policy.resource,
            action,
          );

          if (!exists) {
            await this.enforcer.addPolicy(
              role,
              policy.resource,
              action,
            );

            this.logger.log(
              `Policy added: ${role} → ${policy.resource}:${action}`,
            );
          }
        }
      }
    }
  }
}
