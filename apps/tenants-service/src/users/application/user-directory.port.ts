export const USER_DIRECTORY_PORT = Symbol('UserDirectoryPort');

export interface UserDirectoryPort {
  assertExists(userId: string): Promise<void>;
}
