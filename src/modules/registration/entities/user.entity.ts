// entities/user.entity.ts

/**
 * User entity for registration module
 * Independent entity class for user registration data and operations
 */
export class UserEntity {
  id: string;
  email: string;
  password?: string; // Only for creation/registration
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<UserEntity>) {
    Object.assign(this, data);
  }

  /**
   * Generate activation code for user registration
   * @returns A random 6-digit numeric activation code
   */
  static generateActivationCode(): string {
    // Generate a 6-digit numeric code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Check if the verification token is expired
   * @returns true if expired or no expiration date
   */
  isVerificationTokenExpired(): boolean {
    if (!this.verificationTokenExpiresAt) return true;
    return new Date() > this.verificationTokenExpiresAt;
  }

  /**
   * Get full name of the user
   * @returns Full name or email if no name provided
   */
  getFullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    if (this.firstName) return this.firstName;
    if (this.lastName) return this.lastName;
    return this.email;
  }

  /**
   * Create a new UserEntity for registration
   * @param registrationData - Data for user registration
   * @returns UserEntity instance with generated activation code
   */
  static createForRegistration(registrationData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): UserEntity {
    const activationCode = this.generateActivationCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiration

    return new UserEntity({
      ...registrationData,
      isActive: false, // User starts inactive until email verification
      emailVerified: false,
      verificationToken: activationCode,
      verificationTokenExpiresAt: expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
