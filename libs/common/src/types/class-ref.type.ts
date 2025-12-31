export interface ClassRef<T = any> {
  new (...args: any[]): T;
}
