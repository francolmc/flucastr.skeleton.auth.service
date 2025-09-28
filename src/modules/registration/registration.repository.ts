// registration.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UserEntity } from './entities/user.entity';
import { Prisma } from 'generated/prisma';
import { RegistrationRepositoryInterface } from './interfaces/registration-repository.interface';

@Injectable()
export class RegistrationRepository implements RegistrationRepositoryInterface {
  private readonly logger = new Logger(RegistrationRepository.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Create a new user registration
   */
  async create(user: UserEntity): Promise<UserEntity> {
    try {
      this.logger.log(`Creating user registration: ${user.email}`);

      const createdUser = await this.databaseService.user.create({
        data: {
          email: user.email,
          password: user.password!,
          secretKey: user.secretKey,
          refreshSecretKey: user.refreshSecretKey,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          verificationToken: user.verificationToken,
          verificationTokenExpiresAt: user.verificationTokenExpiresAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });

      return this.toUserEntity(createdUser);
    } catch (error) {
      this.logger.error(`Failed to create user: ${user.email}`, error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserEntity | null> {
    try {
      const user = await this.databaseService.user.findUnique({
        where: { id },
      });

      return user ? this.toUserEntity(user) : null;
    } catch (error) {
      this.logger.error(`Failed to find user by id: ${id}`, error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      this.logger.log(`Finding user by email: ${email}`);

      const user = await this.databaseService.user.findUnique({
        where: { email },
      });

      return user ? this.toUserEntity(user) : null;
    } catch (error) {
      this.logger.error(`Failed to find user by email: ${email}`, error);
      throw error;
    }
  }

  /**
   * Find user by verification token
   */
  async findByVerificationToken(token: string): Promise<UserEntity | null> {
    try {
      this.logger.log(`Finding user by verification token`);

      const user = await this.databaseService.user.findFirst({
        where: {
          verificationToken: token,
        },
      });

      return user ? this.toUserEntity(user) : null;
    } catch (error) {
      this.logger.error('Failed to find user by verification token', error);
      throw error;
    }
  }

  /**
   * Update user verification status
   */
  async updateVerificationStatus(
    id: string,
    emailVerified: boolean,
    verificationToken?: string | null,
    verificationTokenExpiresAt?: Date,
  ): Promise<UserEntity> {
    try {
      this.logger.log(`Updating verification status for user: ${id}`);

      const updateData: Prisma.UserUpdateInput = {
        emailVerified,
        updatedAt: new Date(),
      };

      if (verificationToken !== undefined) {
        updateData.verificationToken = verificationToken;
      }

      if (verificationTokenExpiresAt !== undefined) {
        updateData.verificationTokenExpiresAt = verificationTokenExpiresAt;
      }

      const updatedUser = await this.databaseService.user.update({
        where: { id },
        data: updateData,
      });

      return this.toUserEntity(updatedUser);
    } catch (error) {
      this.logger.error(
        `Failed to update verification status for user: ${id}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Update user entity
   */
  async update(id: string, updates: Partial<UserEntity>): Promise<UserEntity> {
    try {
      this.logger.log(`Updating user: ${id}`);

      const updateData: Prisma.UserUpdateInput = {
        updatedAt: new Date(),
      };

      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.password !== undefined)
        updateData.password = updates.password;
      if (updates.firstName !== undefined)
        updateData.firstName = updates.firstName;
      if (updates.lastName !== undefined)
        updateData.lastName = updates.lastName;
      if (updates.isActive !== undefined)
        updateData.isActive = updates.isActive;
      if (updates.emailVerified !== undefined)
        updateData.emailVerified = updates.emailVerified;
      if (updates.verificationToken !== undefined)
        updateData.verificationToken = updates.verificationToken;
      if (updates.verificationTokenExpiresAt !== undefined)
        updateData.verificationTokenExpiresAt =
          updates.verificationTokenExpiresAt;

      const updatedUser = await this.databaseService.user.update({
        where: { id },
        data: updateData,
      });

      return this.toUserEntity(updatedUser);
    } catch (error) {
      this.logger.error(`Failed to update user: ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    try {
      this.logger.log(`Deleting user: ${id}`);

      await this.databaseService.user.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to delete user: ${id}`, error);
      throw error;
    }
  }

  /**
   * Check if email exists
   */
  async existsByEmail(email: string, excludeId?: string): Promise<boolean> {
    try {
      const count = await this.databaseService.user.count({
        where: {
          email,
          ...(excludeId && { id: { not: excludeId } }),
        },
      });

      return count > 0;
    } catch (error) {
      this.logger.error(`Failed to check if email exists: ${email}`, error);
      throw error;
    }
  }

  /**
   * Convert Prisma User to UserEntity
   */
  private toUserEntity(
    user: Prisma.UserGetPayload<{
      select: {
        id: true;
        email: true;
        password: true;
        secretKey: true;
        refreshSecretKey: true;
        firstName: true;
        lastName: true;
        isActive: true;
        emailVerified: true;
        verificationToken: true;
        verificationTokenExpiresAt: true;
        createdAt: true;
        updatedAt: true;
      };
    }>,
  ): UserEntity {
    return new UserEntity({
      id: user.id,
      email: user.email,
      password: user.password,
      secretKey: user.secretKey,
      refreshSecretKey: user.refreshSecretKey,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      verificationToken: user.verificationToken || undefined,
      verificationTokenExpiresAt: user.verificationTokenExpiresAt || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
