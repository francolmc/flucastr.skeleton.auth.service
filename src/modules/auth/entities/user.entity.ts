// entities/user.entity.ts
import * as bcrypt from 'bcrypt';
import {
  AuthStatus,
  TokenType,
  AccessTokenPayload,
  RefreshTokenPayload,
  UserSession,
  AUTH_STATUS_TRANSITIONS,
  AccountLockReason,
} from './types';

/**
 * User entity for authentication module
 * Extends base user functionality with authentication-specific business logic
 */
export class User {
  // Basic user data
  id: string;
  email: string;
  password?: string; // Hashed password - only available during auth operations
  secretKey: string; // JWT secret key unique per user
  refreshSecretKey: string; // Refresh token secret key unique per user

  // Profile information
  firstName?: string;
  lastName?: string;

  // Authentication status
  isActive: boolean;
  emailVerified: boolean;
  authStatus: AuthStatus;

  // Security fields
  lastLoginAt?: Date;
  lastLoginIp?: string;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  lockReason?: AccountLockReason;

  // Email verification
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;

  // Password reset
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<User>) {
    Object.assign(this, data);

    // Set defaults
    this.authStatus = this.authStatus || AuthStatus.PENDING;
    this.failedLoginAttempts = this.failedLoginAttempts || 0;
    this.isActive = this.isActive ?? true;
    this.emailVerified = this.emailVerified ?? false;
  }

  // === Authentication Status Methods ===

  /**
   * Check if user can authenticate
   */
  canAuthenticate(): boolean {
    return (
      this.isActive && this.authStatus === AuthStatus.ACTIVE && !this.isLocked()
    );
  }

  /**
   * Check if user account is locked
   */
  isLocked(): boolean {
    if (!this.lockedUntil) return false;
    return new Date() < this.lockedUntil;
  }

  /**
   * Check if user is pending email verification
   */
  isPendingVerification(): boolean {
    return this.authStatus === AuthStatus.PENDING || !this.emailVerified;
  }

  /**
   * Check if user is suspended
   */
  isSuspended(): boolean {
    return this.authStatus === AuthStatus.SUSPENDED;
  }

  /**
   * Check if user is blocked permanently
   */
  isBlocked(): boolean {
    return this.authStatus === AuthStatus.BLOCKED;
  }

  // === Status Transition Methods ===

  /**
   * Activate user account
   */
  activate(): void {
    if (this.canTransitionTo(AuthStatus.ACTIVE)) {
      this.authStatus = AuthStatus.ACTIVE;
      this.resetFailedAttempts();
      this.unlock();
    } else {
      throw new Error(`Cannot activate user from status: ${this.authStatus}`);
    }
  }

  /**
   * Deactivate user account
   */
  deactivate(): void {
    if (this.canTransitionTo(AuthStatus.INACTIVE)) {
      this.authStatus = AuthStatus.INACTIVE;
      this.isActive = false;
    } else {
      throw new Error(`Cannot deactivate user from status: ${this.authStatus}`);
    }
  }

  /**
   * Suspend user account temporarily
   */
  suspend(reason?: AccountLockReason): void {
    if (this.canTransitionTo(AuthStatus.SUSPENDED)) {
      this.authStatus = AuthStatus.SUSPENDED;
      this.lockReason = reason;
    } else {
      throw new Error(`Cannot suspend user from status: ${this.authStatus}`);
    }
  }

  /**
   * Block user account permanently
   */
  block(reason?: AccountLockReason): void {
    if (this.canTransitionTo(AuthStatus.BLOCKED)) {
      this.authStatus = AuthStatus.BLOCKED;
      this.isActive = false;
      this.lockReason = reason;
    } else {
      throw new Error(`Cannot block user from status: ${this.authStatus}`);
    }
  }

  /**
   * Check if user can transition to a new status
   */
  private canTransitionTo(newStatus: AuthStatus): boolean {
    const allowedTransitions = AUTH_STATUS_TRANSITIONS[this.authStatus];
    return allowedTransitions.includes(newStatus);
  }

  // === Password Methods ===

  /**
   * Verify password against stored hash
   */
  async verifyPassword(plainPassword: string): Promise<boolean> {
    if (!this.password) {
      throw new Error('Password not available for verification');
    }
    return await bcrypt.compare(plainPassword, this.password);
  }

  /**
   * Hash and set new password
   */
  async setPassword(plainPassword: string): Promise<void> {
    const saltRounds = 12;
    this.password = await bcrypt.hash(plainPassword, saltRounds);
  }

  /**
   * Clear password from memory (security)
   */
  clearPassword(): void {
    delete this.password;
  }

  // === Login Attempt Methods ===

  /**
   * Record successful login
   */
  recordSuccessfulLogin(ipAddress?: string): void {
    this.lastLoginAt = new Date();
    this.lastLoginIp = ipAddress;
    this.resetFailedAttempts();
  }

  /**
   * Record failed login attempt
   */
  recordFailedLogin(): void {
    this.failedLoginAttempts += 1;

    // Lock account after 5 failed attempts
    if (this.failedLoginAttempts >= 5) {
      this.lockAccount(AccountLockReason.MULTIPLE_FAILED_ATTEMPTS, 30); // 30 minutes
    }
  }

  /**
   * Reset failed login attempts counter
   */
  resetFailedAttempts(): void {
    this.failedLoginAttempts = 0;
  }

  /**
   * Lock account for specified duration
   */
  lockAccount(reason: AccountLockReason, durationMinutes: number = 30): void {
    this.lockedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
    this.lockReason = reason;
  }

  /**
   * Unlock account manually
   */
  unlock(): void {
    this.lockedUntil = undefined;
    this.lockReason = undefined;
  }

  // === Email Verification Methods ===

  /**
   * Mark email as verified
   */
  verifyEmail(): void {
    this.emailVerified = true;
    this.verificationToken = undefined;
    this.verificationTokenExpiresAt = undefined;

    // Activate account if it was pending
    if (this.authStatus === AuthStatus.PENDING) {
      this.authStatus = AuthStatus.ACTIVE;
    }
  }

  /**
   * Set email verification token
   */
  setEmailVerificationToken(token: string, expiresInHours: number = 24): void {
    this.verificationToken = token;
    this.verificationTokenExpiresAt = new Date(
      Date.now() + expiresInHours * 60 * 60 * 1000,
    );
  }

  /**
   * Check if email verification token is valid
   */
  isEmailVerificationTokenValid(token: string): boolean {
    if (!this.verificationToken || !this.verificationTokenExpiresAt) {
      return false;
    }

    return (
      this.verificationToken === token &&
      new Date() < this.verificationTokenExpiresAt
    );
  }

  // === Password Reset Methods ===

  /**
   * Set password reset token
   */
  setPasswordResetToken(token: string, expiresInMinutes: number = 15): void {
    this.resetPasswordToken = token;
    this.resetPasswordExpiresAt = new Date(
      Date.now() + expiresInMinutes * 60 * 1000,
    );
  }

  /**
   * Check if password reset token is valid
   */
  isPasswordResetTokenValid(token: string): boolean {
    if (!this.resetPasswordToken || !this.resetPasswordExpiresAt) {
      return false;
    }

    return (
      this.resetPasswordToken === token &&
      new Date() < this.resetPasswordExpiresAt
    );
  }

  /**
   * Complete password reset
   */
  async completePasswordReset(newPassword: string): Promise<void> {
    await this.setPassword(newPassword);
    this.resetPasswordToken = undefined;
    this.resetPasswordExpiresAt = undefined;
    this.resetFailedAttempts();
    this.unlock();
  }

  // === JWT Token Payload Methods ===

  /**
   * Create access token payload
   */
  createAccessTokenPayload(): AccessTokenPayload {
    return {
      sub: this.id,
      email: this.email,
      type: TokenType.ACCESS,
      isActive: this.isActive,
      emailVerified: this.emailVerified,
    };
  }

  /**
   * Create refresh token payload
   */
  createRefreshTokenPayload(tokenId: string): RefreshTokenPayload {
    return {
      sub: this.id,
      email: this.email,
      type: TokenType.REFRESH,
      tokenId,
    };
  }

  /**
   * Create user session information
   */
  createUserSession(): UserSession {
    return {
      userId: this.id,
      email: this.email,
      isActive: this.isActive,
      emailVerified: this.emailVerified,
      lastLoginAt: this.lastLoginAt || new Date(),
      ipAddress: this.lastLoginIp,
    };
  }

  // === Utility Methods ===

  /**
   * Get display name for user
   */
  getDisplayName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    if (this.firstName) {
      return this.firstName;
    }
    return this.email;
  }

  /**
   * Get account status summary
   */
  getAccountStatus(): {
    status: AuthStatus;
    canLogin: boolean;
    isLocked: boolean;
    lockReason?: AccountLockReason;
    lockedUntil?: Date;
  } {
    return {
      status: this.authStatus,
      canLogin: this.canAuthenticate(),
      isLocked: this.isLocked(),
      lockReason: this.lockReason,
      lockedUntil: this.lockedUntil,
    };
  }

  /**
   * Convert to safe object (without sensitive data)
   */
  toSafeObject(): Record<string, any> {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      password,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      secretKey,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      refreshSecretKey,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      verificationToken,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      resetPasswordToken,
      ...safeData
    } = this;
    return safeData;
  }
}
