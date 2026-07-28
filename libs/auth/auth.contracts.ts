export interface AuthPayload {
  userId: string;
  phoneNumber: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthTokenProviderPort {
  generateAuthTokens(payload: AuthPayload): Promise<AuthTokens>;
}
