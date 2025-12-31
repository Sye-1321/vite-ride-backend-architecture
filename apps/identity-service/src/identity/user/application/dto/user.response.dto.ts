import { ResponseBase } from '@app/common/api';
import { AuthTokens } from '../types';

export interface UserResponse extends ResponseBase {
  id:string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  status: string;
}

export interface UserSignedInResponse extends UserResponse {
  tokens: AuthTokens;
}

export type UserResponseDto = UserResponse | UserSignedInResponse;