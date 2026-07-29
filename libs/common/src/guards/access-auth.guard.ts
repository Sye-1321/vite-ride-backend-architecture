import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class AccessAuthGuard extends AuthGuard('jwt-access') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    return (await super.canActivate(context)) as boolean;
  }
}
