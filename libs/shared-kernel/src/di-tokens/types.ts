export const TYPES = {
  jwtAccessTokenSecret: 'JWT_ACCESS_TOKEN_SECRET',
  AccessTokenExpiresIn: 'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
  jwtRefreshTokenSecret: 'JWT_REFRESH_TOKEN_SECRET',
  refreshTokenExpiresIn: 'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
  ILogger: Symbol('ILogger'),

  //port
  AuthTokenProvider: Symbol('AuthTokenProvider'),
  VerificationSessionRepository: Symbol('VerificationSessionRepository'),
  VerificationSessionRepositoryPort: Symbol('VerificationSessionRepositoryPort'),
  VerificationSessionServicePort: Symbol('VerificationSessionServicePort'),
  IVerificationSessionCreator: Symbol('IVerificationSessionCreator'),

  // clean
  UserRepositoryPort: Symbol('UserRepositoryPort'),
  HasherPort: Symbol('HasherPort'),
  TokenGeneratorPort: Symbol('TokenGeneratorPort'),
  OtpGeneratorPort: Symbol('OtpGeneratorPort'),
  AuthzAdapterPort: Symbol('AuthzAdapterPort'),
  AuthzEnforcerPort: Symbol('AuthzEnforcerPort'),
  TenantRepositoryPort: Symbol('TenantRepositoryPort'),
  TenantMemberRepositoryPort: Symbol('TenantMemberRepositoryPort'),
  DriverRepositoryPort: Symbol('DriverRepositoryPort'),

  // interfaces
  IUserRequestContextService: Symbol('IUserRequestContextService'),
  ITenantContextService: Symbol('ITenantContextService'),

  // clean
  IVerificationSessionService: Symbol('IVerificationSessionService'),

  ICasbinAdapter: Symbol('ICasbinAdapter'),

  //
  AuthorizationQueryPort: Symbol('AuthorizationQueryPort'),
  PolicyCommandPort: Symbol('PolicyCommandPort'),
  RoleAssignmentPort: Symbol('RoleAssignmentPort'),
  //
  SmsPort: Symbol('SmsPort'),
  PushPort: Symbol('PushPort'),
  VerificationNotificationPort: Symbol('VerificationNotificationPort'),
  RedisClientPort: Symbol('RedisClientPort'),
  RequestContextAccessor: Symbol('RequestContextAccessor'),

  //
  RoutingServicePort: Symbol('RoutingServicePort'),
};
