import { RequestContext } from './request-context';

export interface RequestContextAccessor {
  get(): RequestContext;
}