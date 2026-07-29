import { Entity, ValueObject } from '../domain';

function isEntity(obj: unknown): obj is Entity<unknown> {
  /**
   * 'instanceof Entity' causes error here for some reason.
   * Probably creates some circular dependency. This is a workaround
   * until I find a solution :)
   */
  return (
    Object.prototype.hasOwnProperty.call(obj, 'toObject') &&
    Object.prototype.hasOwnProperty.call(obj, 'id') &&
    ValueObject.isValueObject((obj as Entity<unknown>).id)
  );
}

function toPlainObject(item: unknown): unknown {
  if (item === undefined || item === null) {
    return item;
  }
  if (ValueObject.isValueObject(item)) {
    return item.unpack();
  }
  if (isEntity(item)) {
    return item.toObject();
  }

  return item;
}

/**
 * Converts Entity/Value Objects props to a plain object.
 * Useful for testing and debugging.
 * @param props
 */
export function propsToObject<T>(props: T): T {
  const propsCopy = structuredClone(props);
  if (typeof propsCopy !== 'object' || propsCopy === null) {
    return toPlainObject(propsCopy) as T;
  }
  const record = propsCopy as Record<string, unknown>;

  // eslint-disable-next-line guard-for-in
  for (const prop in record) {
    if (Array.isArray(record[prop])) {
      record[prop] = (record[prop] as Array<unknown>).map((item) => {
        return toPlainObject(item);
      });
    }
    record[prop] = toPlainObject(record[prop]);
  }

  return propsCopy;
}
