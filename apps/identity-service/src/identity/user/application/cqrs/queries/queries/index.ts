import { GetMyProfileHandler } from './get-my-profile/get-my-profile.handler';
import { GetUserByIdHandler } from './get-user-by-id/get-user-by-id.handler';
import { CheckUserExistsByPhoneHandler } from './check-user-exists-by-phone/check-user-exists-by-phone.handler';
import { ListUsersHandler } from './list-users/list-users.handler';
import { SearchUsersHandler } from './search-users/search-users.handler';

export const UserQueryHandlers = [
  GetMyProfileHandler,
  GetUserByIdHandler,
  CheckUserExistsByPhoneHandler,
  ListUsersHandler,
  SearchUsersHandler,
];
