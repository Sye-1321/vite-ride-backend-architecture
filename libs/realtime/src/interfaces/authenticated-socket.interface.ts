import { IncomingMessage } from 'http';

export interface AuthenticatedRequest extends IncomingMessage {
  user?: {
    userId: string;
    phoneNumber: string;
  };
}
