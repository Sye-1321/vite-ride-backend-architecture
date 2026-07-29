export interface ClassRef<T = unknown> {
  new (...args: never[]): T;
}
