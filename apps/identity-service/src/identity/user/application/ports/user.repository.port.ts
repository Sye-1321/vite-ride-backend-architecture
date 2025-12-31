import { Option } from 'oxide.ts';
import { RepositoryPort } from '@app/shared-kernel';
import { User } from '../../domain/user.entity';

export interface UserRepositoryPort
  extends RepositoryPort<User> {

  findByPhoneNumber(
    phoneNumber: string,
  ): Promise<Option<User>>;
}
