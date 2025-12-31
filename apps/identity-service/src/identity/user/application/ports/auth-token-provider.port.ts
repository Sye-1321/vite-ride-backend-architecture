import { AuthPayload, AuthTokens } from "../types";

export interface AuthTokenProviderPort {
  generateAuthTokens(payload: AuthPayload): Promise<AuthTokens>;
}
