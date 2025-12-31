import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class AccessAuthGuard extends AuthGuard('jwt-access') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('AccessAuthGuard called');

    const result = (await super.canActivate(context)) as boolean;

    console.log('AccessAuthGuard result:', result);

    return result;
  }
}
