/**
 * Repository para el módulo de Registration
 * Maneja el acceso a datos usando Prisma
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { RegistrationRepositoryInterface } from '../interfaces';
import { UserRegistration } from '../entities';
import { CreateUserData, UpdateUserData } from '../entities/types';

@Injectable()
export class RegistrationRepository implements RegistrationRepositoryInterface {
  private readonly logger = new Logger(RegistrationRepository.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Crea un nuevo usuario en la base de datos
   */
  async create(data: CreateUserData): Promise<UserRegistration> {
    this.logger.log(`Creating user: ${JSON.stringify(data)}`);

    try {
      const user = await this.databaseService.user.create({
        data: {
          email: data.email,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          tenantId: data.tenantId,
          isActive: true, // Por defecto activo
          isVerified: false, // Por defecto no verificado
        },
      });

      this.logger.log(`User created successfully: ${user.id} - ${user.email}`);
      return this.mapToUserRegistration(user);
    } catch (error) {
      this.logger.error('Error creating user:', {
        data,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Busca un usuario por su email
   */
  async findByEmail(email: string): Promise<UserRegistration | null> {
    this.logger.log(`Finding user by email: ${email}`);

    try {
      const user = await this.databaseService.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        this.logger.warn(`User with email ${email} not found`);
        return null;
      }

      this.logger.log(`User found: ${user.email}`);
      return this.mapToUserRegistration(user);
    } catch (error) {
      this.logger.error(`Error finding user by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Busca un usuario por su nombre de usuario
   */
  async findByUsername(username: string): Promise<UserRegistration | null> {
    this.logger.log(`Finding user by username: ${username}`);

    try {
      const user = await this.databaseService.user.findUnique({
        where: { username },
      });

      if (!user) {
        this.logger.warn(`User with username ${username} not found`);
        return null;
      }

      this.logger.log(`User found: ${user.username}`);
      return this.mapToUserRegistration(user);
    } catch (error) {
      this.logger.error(`Error finding user by username ${username}:`, error);
      throw error;
    }
  }

  /**
   * Busca un usuario por su ID
   */
  async findById(id: string): Promise<UserRegistration | null> {
    this.logger.log(`Finding user by ID: ${id}`);

    try {
      const user = await this.databaseService.user.findUnique({
        where: { id },
      });

      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        return null;
      }

      this.logger.log(`User found: ${user.email}`);
      return this.mapToUserRegistration(user);
    } catch (error) {
      this.logger.error(`Error finding user by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza un usuario existente
   */
  async update(id: string, data: UpdateUserData): Promise<UserRegistration> {
    this.logger.log(`Updating user ${id}: ${JSON.stringify(data)}`);

    try {
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Preparar los datos de actualización (sin password ya que no se almacena en BD)
      const updateData: {
        email?: string;
        username?: string;
        firstName?: string;
        lastName?: string;
        isActive?: boolean;
        isVerified?: boolean;
      } = {};

      if (data.email !== undefined) {
        updateData.email = data.email.toLowerCase();
      }
      if (data.username !== undefined) {
        updateData.username = data.username;
      }
      if (data.firstName !== undefined) {
        updateData.firstName = data.firstName;
      }
      if (data.lastName !== undefined) {
        updateData.lastName = data.lastName;
      }
      if (data.isActive !== undefined) {
        updateData.isActive = data.isActive;
      }
      if (data.isVerified !== undefined) {
        updateData.isVerified = data.isVerified;
      }

      const updatedUser = await this.databaseService.user.update({
        where: { id },
        data: updateData,
      });

      this.logger.log(
        `User updated successfully: ${updatedUser.id} - ${updatedUser.email}`,
      );
      return this.mapToUserRegistration(updatedUser);
    } catch (error) {
      this.logger.error(`Error updating user ${id}:`, {
        data,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Mapea el resultado de Prisma a UserRegistration
   */
  private mapToUserRegistration(user: {
    id: string;
    email: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    isActive: boolean;
    isVerified: boolean;
    tenantId: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
  }): UserRegistration {
    return new UserRegistration({
      id: user.id,
      email: user.email,
      username: user.username || undefined,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      password: '', // TODO: Password no se almacena en BD, se maneja por separado
      isActive: user.isActive,
      isVerified: user.isVerified,
      tenantId: user.tenantId || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt || undefined,
    });
  }
}
