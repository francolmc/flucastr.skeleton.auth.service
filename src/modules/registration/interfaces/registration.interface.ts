// interfaces/registration.interface.ts

import { RegistrationStatus } from '../entities/types';

/**
 * Metrics for registration module
 * Provides statistics about user registrations
 */
export interface RegistrationMetrics {
  total: number;
  pending: number;
  verified: number;
  expired: number;
  failed: number;
  createdToday: number;
  verifiedToday: number;
}

/**
 * Filters for registration queries
 * Used to filter and search registration records
 */
export interface RegistrationFilters {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  verified?: boolean;
  hasExpiredToken?: boolean;
}

/**
 * Registration response interface
 * Public data returned for registration queries
 */
export interface RegistrationResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  emailVerified: boolean;
  status: RegistrationStatus;
  createdAt: Date;
  updatedAt: Date;
  verificationTokenExpiresAt?: Date;
}

/**
 * Email verification data interface
 * Data required for email verification process
 */
export interface EmailVerificationData {
  userId: string;
  email: string;
  verificationToken: string;
  expiresAt: Date;
}

/**
 * Registration statistics interface
 * Detailed statistics for admin dashboard
 */
export interface RegistrationStatistics {
  daily: {
    date: string;
    registrations: number;
    verifications: number;
    successRate: number;
  }[];
  weekly: {
    week: string;
    registrations: number;
    verifications: number;
    successRate: number;
  }[];
  monthly: {
    month: string;
    registrations: number;
    verifications: number;
    successRate: number;
  }[];
}

/**
 * Registration summary interface
 * Quick overview for dashboard
 */
export interface RegistrationSummary {
  totalUsers: number;
  activeUsers: number;
  pendingVerifications: number;
  expiredTokens: number;
  recentRegistrations: RegistrationResponse[];
  topRegistrationDays: {
    date: string;
    count: number;
  }[];
}

/**
 * Verification attempt interface
 * Tracks verification attempts for security
 */
export interface VerificationAttempt {
  id: string;
  userId: string;
  email: string;
  token: string;
  attempts: number;
  maxAttempts: number;
  isLocked: boolean;
  lockedUntil?: Date;
  createdAt: Date;
  lastAttemptAt: Date;
}

/**
 * Registration configuration interface
 * Configuration settings for registration process
 */
export interface RegistrationConfig {
  activationCodeLength: number;
  activationCodeExpiryHours: number;
  maxVerificationAttempts: number;
  lockoutDurationMinutes: number;
  requireEmailVerification: boolean;
  allowResendVerification: boolean;
  resendCooldownMinutes: number;
}

/**
 * Registration workflow interface
 * Defines the steps in the registration process
 */
export interface RegistrationWorkflow {
  step:
    | 'data_collection'
    | 'email_verification'
    | 'account_activation'
    | 'completed';
  isCompleted: boolean;
  nextAction?: string;
  requiresUserAction: boolean;
  estimatedCompletionTime?: number; // minutes
}

/**
 * Bulk registration interface
 * For importing users in bulk operations
 */
export interface BulkRegistrationData {
  users: {
    email: string;
    firstName?: string;
    lastName?: string;
    password?: string; // optional for bulk import
  }[];
  sendVerificationEmails: boolean;
  skipExistingUsers: boolean;
}

/**
 * Registration event interface
 * For logging and auditing registration events
 */
export interface RegistrationEvent {
  id: string;
  userId: string;
  eventType:
    | 'registration_started'
    | 'verification_sent'
    | 'verification_attempted'
    | 'verification_succeeded'
    | 'verification_failed'
    | 'account_activated'
    | 'registration_expired';
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
