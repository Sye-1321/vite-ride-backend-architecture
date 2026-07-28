import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { RequestContext } from './request-context';
import { RequestContextAccessor } from './request-context.accessor';

@Injectable()
export class ClsRequestContextAccessor implements RequestContextAccessor {
  private static readonly KEY = 'ctx.request';

  constructor(private readonly cls: ClsService) {}

  set(context: RequestContext): void {
    this.cls.set(ClsRequestContextAccessor.KEY, context);
  }

  get(): RequestContext {
    const ctx = this.cls.get<RequestContext>(ClsRequestContextAccessor.KEY);
    return ctx;
  }
}
