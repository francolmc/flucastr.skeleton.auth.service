// registration.service.ts
import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { RegistrationRepository } from './registration.repository';
import { UserEntity } from './entities/user.entity';
import {
  RegisterUserDto,
  VerifyEmailDto,
  ResendVerificationDto,
  UpdateUserDto,
} from './dtos';

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    private readonly registrationRepository: RegistrationRepository,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterUserDto): Promise<UserEntity> {
    this.logger.log(`Registering user: ${registerDto.email}`);

    // Check if email already exists
    const existingUser = await this.registrationRepository.findByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email address already registered');
    }

    // Hash password (simplified for now - in production use bcrypt)
    const hashedPassword = await this.hashPassword(registerDto.password);

    // Generate verification token and expiration date
    const verificationToken = randomUUID();
    const verificationTokenExpiresAt = new Date();
    verificationTokenExpiresAt.setHours(
      verificationTokenExpiresAt.getHours() + 24,
    ); // 24 hours

    // Generate unique secret keys for this user
    const secretKey = this.generateCuid();
    const refreshSecretKey = this.generateCuid();

    // Create user entity
    const user = new UserEntity({
      email: registerDto.email,
      password: hashedPassword,
      secretKey,
      refreshSecretKey,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      isActive: true,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save to database
    return await this.registrationRepository.create(user);
  }

  /**
   * Verify user email with token
   */
  async verifyEmail(verifyDto: VerifyEmailDto): Promise<UserEntity> {
    // Find user by verification token
    const user = await this.registrationRepository.findByVerificationToken(
      verifyDto.token,
    );
    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    // Check if token is expired
    if (
      user.verificationTokenExpiresAt &&
      user.verificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Verification token has expired');
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Update verification status
    return await this.registrationRepository.updateVerificationStatus(
      user.id,
      true,
      null, // Clear verification token
    );
  }

  /**
   * Resend verification email
   */
  async resendVerification(
    resendDto: ResendVerificationDto,
  ): Promise<UserEntity> {
    // Find user by email
    const user = await this.registrationRepository.findByEmail(resendDto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new verification token and expiration date
    const verificationToken = randomUUID();
    const verificationTokenExpiresAt = new Date();
    verificationTokenExpiresAt.setHours(
      verificationTokenExpiresAt.getHours() + 24,
    ); // 24 hours

    // Update user with new token
    return await this.registrationRepository.updateVerificationStatus(
      user.id,
      false,
      verificationToken,
      verificationTokenExpiresAt,
    );
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserEntity> {
    const user = await this.registrationRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.registrationRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    return await this.registrationRepository.existsByEmail(email, excludeId);
  }

  /**
   * Update user profile
   */
  async updateUser(id: string, updates: UpdateUserDto): Promise<UserEntity> {
    // Verify user exists
    await this.getUserById(id);

    // Hash password if provided
    const processedUpdates: Partial<UserEntity> = { ...updates };
    if (updates.password) {
      processedUpdates.password = await this.hashPassword(updates.password);
    }

    // Check email uniqueness if email is being updated
    if (updates.email) {
      const emailExists = await this.registrationRepository.existsByEmail(
        updates.email,
        id,
      );
      if (emailExists) {
        throw new ConflictException('Email address already registered');
      }
    }

    // Update user
    return await this.registrationRepository.update(id, processedUpdates);
  }

  /**
   * Soft delete user
   */
  async deactivateUser(id: string): Promise<UserEntity> {
    // Verify user exists
    await this.getUserById(id);

    // Deactivate user
    return await this.registrationRepository.update(id, { isActive: false });
  }

  /**
   * Reactivate user
   */
  async reactivateUser(id: string): Promise<UserEntity> {
    // Verify user exists
    await this.getUserById(id);

    // Reactivate user
    return await this.registrationRepository.update(id, { isActive: true });
  }

  /**
   * Hard delete user
   */
  async deleteUser(id: string): Promise<boolean> {
    // Verify user exists
    await this.getUserById(id);

    // Delete user
    return await this.registrationRepository.delete(id);
  }

  /**
   * Generate a CUID-like string for secret keys
   */
  private generateCuid(): string {
    // Generate 24 random characters (lowercase letters and numbers)
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'c'; // CUIDs start with 'c'

    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // Industry standard
    return await bcrypt.hash(password, saltRounds);
  }
}
