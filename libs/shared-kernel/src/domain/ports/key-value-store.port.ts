import { Option } from 'oxide.ts';

export interface KeyValueStorePort<Value, Key> {
  insert(value: Value, key: Key, ttlSeconds?: number): Promise<void>;

  findOne(key: Key): Promise<Option<Value>>;
  exists(key: Key): Promise<boolean>;
  delete(key: Key): Promise<boolean>;
}
