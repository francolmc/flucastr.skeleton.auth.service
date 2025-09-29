// entities/auth-token.entity.ts
import { JwtService } from '@nestjs/jwt';
import {
  TokenType,
  JwtAlgorithm,
  JwtPayload,
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenValidationResult,
  TokenConfig,
  DEFAULT_TOKEN_CONFIG,
} from './types';

/**
 * AuthToken entity for JWT token management
 * Handles token creation, validation, and lifecycle management
 */
export class AuthToken {
  // Token identification
  id: string; // Unique token identifier
  userId: string; // Owner of the token
  type: TokenType; // Type of token (access, refresh, etc.)

  // Token data
  token: string; // The actual JWT string
  payload: JwtPayload; // Decoded token payload

  // Security and validation
  secretKey: string; // Secret key used to sign this token
  algorithm: JwtAlgorithm; // Algorithm used for signing

  // Lifecycle management
  issuedAt: Date; // When token was created
  expiresAt: Date; // When token expires
  lastUsedAt?: Date; // Last time token was used
  isRevoked: boolean; // Whether token has been revoked
  revokedAt?: Date; // When token was revoked
  revokeReason?: string; // Reason for revocation

  // Metadata
  ipAddress?: string; // IP where token was issued
  userAgent?: string; // User agent when token was issued
  deviceId?: string; // Device identifier (if available)

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<AuthToken>) {
    Object.assign(this, data);

    // Set defaults
    this.isRevoked = this.isRevoked ?? false;
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = this.updatedAt || new Date();
  }

  // === Token Validation Methods ===

  /**
   * Check if token is currently valid
   */
  isValid(): boolean {
    return !this.isRevoked && !this.isExpired() && this.hasValidPayload();
  }

  /**
   * Check if token is expired
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Check if token is revoked
   */
  isTokenRevoked(): boolean {
    return this.isRevoked;
  }

  /**
   * Check if token payload is valid
   */
  hasValidPayload(): boolean {
    return (
      this.payload &&
      this.payload.sub === this.userId &&
      this.payload.type === this.type
    );
  }

  /**
   * Get remaining time until expiration (in seconds)
   */
  getRemainingTime(): number {
    const now = new Date().getTime();
    const expiry = this.expiresAt.getTime();
    const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
    return remaining;
  }

  /**
   * Check if token will expire soon (within specified minutes)
   */
  willExpireSoon(withinMinutes: number = 15): boolean {
    const remainingSeconds = this.getRemainingTime();
    const thresholdSeconds = withinMinutes * 60;
    return remainingSeconds <= thresholdSeconds && remainingSeconds > 0;
  }

  // === Token Lifecycle Methods ===

  /**
   * Mark token as used (update last used timestamp)
   */
  markAsUsed(): void {
    this.lastUsedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Revoke token with reason
   */
  revoke(reason?: string): void {
    this.isRevoked = true;
    this.revokedAt = new Date();
    this.revokeReason = reason;
    this.updatedAt = new Date();
  }

  /**
   * Extend token expiration (if allowed for token type)
   */
  extend(additionalMinutes: number): void {
    if (this.type !== TokenType.REFRESH) {
      throw new Error('Only refresh tokens can be extended');
    }

    if (this.isRevoked) {
      throw new Error('Cannot extend revoked token');
    }

    this.expiresAt = new Date(
      this.expiresAt.getTime() + additionalMinutes * 60 * 1000,
    );
    this.updatedAt = new Date();
  }

  // === Token Information Methods ===

  /**
   * Get token validation result
   */
  getValidationResult(): TokenValidationResult {
    return {
      isValid: this.isValid(),
      payload: this.payload,
      error: this.getValidationError(),
      isExpired: this.isExpired(),
      remainingTime: this.getRemainingTime(),
    };
  }

  /**
   * Get validation error message (if any)
   */
  private getValidationError(): string | undefined {
    if (this.isRevoked) {
      return `Token revoked: ${this.revokeReason || 'No reason provided'}`;
    }

    if (this.isExpired()) {
      return 'Token has expired';
    }

    if (!this.hasValidPayload()) {
      return 'Invalid token payload';
    }

    return undefined;
  }

  /**
   * Get token metadata
   */
  getMetadata(): {
    id: string;
    type: TokenType;
    userId: string;
    issuedAt: Date;
    expiresAt: Date;
    lastUsedAt?: Date;
    isRevoked: boolean;
    revokedAt?: Date;
    revokeReason?: string;
    remainingTime: number;
  } {
    return {
      id: this.id,
      type: this.type,
      userId: this.userId,
      issuedAt: this.issuedAt,
      expiresAt: this.expiresAt,
      lastUsedAt: this.lastUsedAt,
      isRevoked: this.isRevoked,
      revokedAt: this.revokedAt,
      revokeReason: this.revokeReason,
      remainingTime: this.getRemainingTime(),
    };
  }

  // === Static Factory Methods ===

  /**
   * Create access token
   */
  static createAccessToken(
    userId: string,
    payload: AccessTokenPayload,
    secretKey: string,
    config?: Partial<TokenConfig>,
  ): AuthToken {
    const tokenConfig = {
      ...DEFAULT_TOKEN_CONFIG[TokenType.ACCESS],
      ...config,
      secret: secretKey,
    };

    const expiresAt = AuthToken.calculateExpiration(tokenConfig.expiresIn!);

    return new AuthToken({
      id: AuthToken.generateTokenId(),
      userId,
      type: TokenType.ACCESS,
      payload,
      secretKey,
      algorithm: tokenConfig.algorithm!,
      issuedAt: new Date(),
      expiresAt,
    });
  }

  /**
   * Create refresh token
   */
  static createRefreshToken(
    userId: string,
    payload: RefreshTokenPayload,
    secretKey: string,
    config?: Partial<TokenConfig>,
  ): AuthToken {
    const tokenConfig = {
      ...DEFAULT_TOKEN_CONFIG[TokenType.REFRESH],
      ...config,
      secret: secretKey,
    };

    const expiresAt = AuthToken.calculateExpiration(tokenConfig.expiresIn!);

    return new AuthToken({
      id: payload.tokenId,
      userId,
      type: TokenType.REFRESH,
      payload,
      secretKey,
      algorithm: tokenConfig.algorithm!,
      issuedAt: new Date(),
      expiresAt,
    });
  }

  /**
   * Create token from JWT string and validation
   */
  static fromJwtString(
    jwtString: string,
    secretKey: string,
    jwtService: JwtService,
  ): AuthToken {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = jwtService.verify(jwtString, {
        secret: secretKey,
      });

      return new AuthToken({
        id: AuthToken.generateTokenId(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        userId: payload.sub,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        type: payload.type,
        token: jwtString,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        payload,
        secretKey,
        algorithm: JwtAlgorithm.HS256, // Default, should be determined from JWT header
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        issuedAt: new Date((payload.iat || 0) * 1000),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expiresAt: new Date((payload.exp || 0) * 1000),
      });
    } catch (error) {
      throw new Error(
        `Invalid JWT token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // === Utility Methods ===

  /**
   * Generate unique token ID
   */
  private static generateTokenId(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Calculate expiration date from duration
   */
  private static calculateExpiration(expiresIn: string | number): Date {
    let milliseconds: number;

    if (typeof expiresIn === 'number') {
      milliseconds = expiresIn * 1000; // Assume seconds
    } else {
      // Parse string format like '1h', '7d', '15m'
      const match = expiresIn.match(/^(\d+)([smhd])$/);
      if (!match) {
        throw new Error(`Invalid expiration format: ${expiresIn}`);
      }

      const value = parseInt(match[1], 10);
      const unit = match[2];

      switch (unit) {
        case 's':
          milliseconds = value * 1000;
          break;
        case 'm':
          milliseconds = value * 60 * 1000;
          break;
        case 'h':
          milliseconds = value * 60 * 60 * 1000;
          break;
        case 'd':
          milliseconds = value * 24 * 60 * 60 * 1000;
          break;
        default:
          throw new Error(`Invalid time unit: ${unit}`);
      }
    }

    return new Date(Date.now() + milliseconds);
  }

  /**
   * Convert to safe object (without sensitive data)
   */
  toSafeObject(): Record<string, any> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { token, secretKey, payload, ...safeData } = this;
    return safeData;
  }

  /**
   * Convert to JSON representation
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      isValid: this.isValid(),
      isExpired: this.isExpired(),
      isRevoked: this.isRevoked,
      remainingTime: this.getRemainingTime(),
      issuedAt: this.issuedAt,
      expiresAt: this.expiresAt,
      lastUsedAt: this.lastUsedAt,
      revokedAt: this.revokedAt,
      revokeReason: this.revokeReason,
    };
  }
}
