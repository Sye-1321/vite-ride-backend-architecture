import { Socket } from 'socket.io';

import { SocketUser } from '../types';

export interface AuthenticatedSocket extends Socket {
  data: {
    user: SocketUser;
  };
}
