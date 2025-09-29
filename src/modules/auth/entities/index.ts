// entities/index.ts

// Export entity classes
export { User } from './user.entity';
export { AuthToken } from './auth-token.entity';

// Export types and enums
export {
  // Enums
  AuthStatus,
  TokenType,
  JwtAlgorithm,
  AuthEvent,
  AccountLockReason,
} from './types';

// Export types separately
export type {
  TokenConfig,
  JwtPayload,
  AccessTokenPayload,
  RefreshTokenPayload,
  UserSession,
  TokenValidationResult,

  // Constants
  AUTH_STATUS_TRANSITIONS,
  DEFAULT_TOKEN_CONFIG,
} from './types';
