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

function toPlainObject(item: any): any {
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
export function propsToObject(props: any): any {
  const propsCopy = structuredClone(props);

  // eslint-disable-next-line guard-for-in
  for (const prop in propsCopy) {
    if (Array.isArray(propsCopy[prop])) {
      propsCopy[prop] = (propsCopy[prop] as Array<unknown>).map((item) => {
        return toPlainObject(item);
      });
    }
    propsCopy[prop] = toPlainObject(propsCopy[prop]);
  }

  return propsCopy;
}
