// entities/types.ts

/**
 * Estados de autenticación del usuario
 */
export enum AuthStatus {
  ACTIVE = 'active', // Usuario activo - puede autenticarse
  INACTIVE = 'inactive', // Usuario inactivo - cuenta deshabilitada
  PENDING = 'pending', // Usuario pendiente - email no verificado
  SUSPENDED = 'suspended', // Usuario suspendido - bloqueado temporalmente
  BLOCKED = 'blocked', // Usuario bloqueado - acceso permanentemente denegado
}

/**
 * Tipos de tokens JWT
 */
export enum TokenType {
  ACCESS = 'access', // Token de acceso - para autenticación
  REFRESH = 'refresh', // Token de refresco - para renovar access tokens
  RESET_PASSWORD = 'reset_password', // Token para reset de contraseña
  EMAIL_VERIFICATION = 'email_verification', // Token para verificación de email
}

/**
 * Algoritmos JWT soportados
 */
export enum JwtAlgorithm {
  HS256 = 'HS256',
  HS384 = 'HS384',
  HS512 = 'HS512',
  RS256 = 'RS256',
  RS384 = 'RS384',
  RS512 = 'RS512',
}

/**
 * Eventos de autenticación para auditoría
 */
export enum AuthEvent {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  TOKEN_REFRESH = 'token_refresh',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFIED = 'email_verified',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
}

/**
 * Razones de bloqueo/suspensión de cuenta
 */
export enum AccountLockReason {
  MULTIPLE_FAILED_ATTEMPTS = 'multiple_failed_attempts',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SECURITY_VIOLATION = 'security_violation',
  ADMINISTRATIVE_ACTION = 'administrative_action',
  POLICY_VIOLATION = 'policy_violation',
}

/**
 * Configuración de token JWT
 */
export interface TokenConfig {
  secret: string;
  algorithm: JwtAlgorithm;
  expiresIn: string | number;
  issuer?: string;
  audience?: string;
}

/**
 * Payload base para tokens JWT
 */
export interface JwtPayload {
  sub: string; // Subject (user ID)
  email: string; // Email del usuario
  type: TokenType; // Tipo de token
  iat?: number; // Issued at
  exp?: number; // Expiration time
  iss?: string; // Issuer
  aud?: string; // Audience
}

/**
 * Payload específico para access token
 */
export interface AccessTokenPayload extends JwtPayload {
  type: TokenType.ACCESS;
  isActive: boolean;
  emailVerified: boolean;
  roles?: string[]; // Roles del usuario (si aplica)
  permissions?: string[]; // Permisos específicos (si aplica)
}

/**
 * Payload específico para refresh token
 */
export interface RefreshTokenPayload extends JwtPayload {
  type: TokenType.REFRESH;
  tokenId: string; // ID único del refresh token
}

/**
 * Información de sesión de usuario
 */
export interface UserSession {
  userId: string;
  email: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Resultado de validación de token
 */
export interface TokenValidationResult {
  isValid: boolean;
  payload?: JwtPayload;
  error?: string;
  isExpired?: boolean;
  remainingTime?: number; // Tiempo restante en segundos
}

/**
 * Transiciones de estado válidas para AuthStatus
 */
export const AUTH_STATUS_TRANSITIONS: Record<AuthStatus, AuthStatus[]> = {
  [AuthStatus.PENDING]: [AuthStatus.ACTIVE, AuthStatus.BLOCKED],
  [AuthStatus.ACTIVE]: [
    AuthStatus.INACTIVE,
    AuthStatus.SUSPENDED,
    AuthStatus.BLOCKED,
  ],
  [AuthStatus.INACTIVE]: [AuthStatus.ACTIVE, AuthStatus.BLOCKED],
  [AuthStatus.SUSPENDED]: [AuthStatus.ACTIVE, AuthStatus.BLOCKED],
  [AuthStatus.BLOCKED]: [], // Estado terminal - no se puede cambiar
};

/**
 * Configuraciones por defecto para tokens
 */
export const DEFAULT_TOKEN_CONFIG: Record<TokenType, Partial<TokenConfig>> = {
  [TokenType.ACCESS]: {
    algorithm: JwtAlgorithm.HS256,
    expiresIn: '1h',
  },
  [TokenType.REFRESH]: {
    algorithm: JwtAlgorithm.HS256,
    expiresIn: '7d',
  },
  [TokenType.RESET_PASSWORD]: {
    algorithm: JwtAlgorithm.HS256,
    expiresIn: '15m',
  },
  [TokenType.EMAIL_VERIFICATION]: {
    algorithm: JwtAlgorithm.HS256,
    expiresIn: '24h',
  },
};
