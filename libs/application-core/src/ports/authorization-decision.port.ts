export const AUTHORIZATION_DECISION_PORT = Symbol('AUTHORIZATION_DECISION_PORT');

export interface AuthorizationDecisionRequest {
  userId: string;
  domain: string;
  resource: string;
  action: string;
}

export interface AuthorizationDecision {
  allowed: boolean;
}

export interface AuthorizationDecisionPort {
  authorize(request: AuthorizationDecisionRequest): Promise<AuthorizationDecision>;
}
