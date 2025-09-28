// entities/types.ts

/**
 * User registration status
 */
export enum RegistrationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
}

/**
 * Activation code configuration
 */
export interface ActivationCodeConfig {
  length: number;
  expiresInMinutes: number;
  numericOnly: boolean;
}

/**
 * Default activation code configuration
 */
export const DEFAULT_ACTIVATION_CONFIG: ActivationCodeConfig = {
  length: 6,
  expiresInMinutes: 24 * 60, // 24 hours
  numericOnly: true,
};

/**
 * User registration data interface
 */
export interface RegistrationData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Registration response interface
 */
export interface RegistrationResponse {
  userId: string;
  email: string;
  activationCode: string;
  expiresAt: Date;
  status: RegistrationStatus;
}
