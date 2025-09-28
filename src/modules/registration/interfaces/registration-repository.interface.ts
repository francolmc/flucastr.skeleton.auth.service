// interfaces/registration-repository.interface.ts

import { UserEntity } from '../entities/user.entity';

/**
 * Repository interface for registration data access
 * Defines contracts for user registration operations
 */
export interface RegistrationRepositoryInterface {
  /**
   * Create a new user registration
   * @param user - User entity to create
   * @returns Promise<UserEntity> - Created user entity
   */
  create(user: UserEntity): Promise<UserEntity>;

  /**
   * Find user by ID
   * @param id - User ID
   * @returns Promise<UserEntity | null> - User entity or null if not found
   */
  findById(id: string): Promise<UserEntity | null>;

  /**
   * Find user by email address
   * @param email - User email
   * @returns Promise<UserEntity | null> - User entity or null if not found
   */
  findByEmail(email: string): Promise<UserEntity | null>;

  /**
   * Find user by verification token
   * @param token - Verification token
   * @returns Promise<UserEntity | null> - User entity or null if not found
   */
  findByVerificationToken(token: string): Promise<UserEntity | null>;

  /**
   * Update user verification status
   * @param id - User ID
   * @param emailVerified - Verification status
   * @param verificationToken - Optional: clear verification token
   * @returns Promise<UserEntity> - Updated user entity
   */
  updateVerificationStatus(
    id: string,
    emailVerified: boolean,
    verificationToken?: string | null,
  ): Promise<UserEntity>;

  /**
   * Update user entity
   * @param id - User ID
   * @param updates - Partial user data to update
   * @returns Promise<UserEntity> - Updated user entity
   */
  update(id: string, updates: Partial<UserEntity>): Promise<UserEntity>;

  /**
   * Delete user by ID
   * @param id - User ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if email is already registered
   * @param email - Email to check
   * @param excludeId - Optional user ID to exclude from check
   * @returns Promise<boolean> - True if email exists
   */
  existsByEmail(email: string, excludeId?: string): Promise<boolean>;
}
