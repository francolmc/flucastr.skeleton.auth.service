/**
 * DTOs para respuestas del módulo Registration
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RegistrationStatus } from '../entities/types';

export class UserResponseDto {
  @ApiProperty({
    description: 'Identificador único del usuario',
    example: 'user-123',
  })
  id: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Nombre de usuario',
    example: 'usuario123',
    nullable: true,
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'Nombre del usuario',
    example: 'Juan',
    nullable: true,
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Apellido del usuario',
    example: 'Pérez',
    nullable: true,
  })
  lastName?: string;

  @ApiProperty({
    description: 'Indica si el usuario está activo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Indica si el usuario está verificado',
    example: true,
  })
  isVerified: boolean;

  @ApiPropertyOptional({
    description: 'ID del tenant para soporte multi-tenant',
    example: 'tenant-123',
    nullable: true,
  })
  tenantId?: string;

  @ApiProperty({
    description: 'Fecha de creación del usuario',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del usuario',
    example: '2024-01-15T14:45:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Fecha del último inicio de sesión',
    example: '2024-01-15T16:20:00.000Z',
    nullable: true,
  })
  lastLoginAt?: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}

export class RegistrationResultResponseDto {
  @ApiProperty({
    description: 'Indica si el registro fue exitoso',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado',
    example: 'Usuario registrado exitosamente',
  })
  message: string;

  @ApiProperty({
    description: 'Email del usuario registrado',
    example: 'usuario@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Estado del registro',
    enum: RegistrationStatus,
    example: RegistrationStatus.COMPLETED,
  })
  status: RegistrationStatus;

  @ApiPropertyOptional({
    description: 'ID del usuario registrado (si fue exitoso)',
    example: 'user-123',
    nullable: true,
  })
  userId?: string;

  @ApiPropertyOptional({
    description: 'Token de verificación (si aplica)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    nullable: true,
  })
  verificationToken?: string;

  @ApiPropertyOptional({
    description: 'Lista de errores (si hubo errores)',
    type: [String],
    nullable: true,
    example: ['El email ya está registrado'],
  })
  errors?: string[];

  constructor(partial: Partial<RegistrationResultResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO para respuestas paginadas de Users
 */
export class PaginatedUserResponseDto {
  @ApiProperty({
    description: 'Lista de usuarios',
    type: [UserResponseDto],
  })
  data: UserResponseDto[];

  @ApiProperty({
    description: 'Metadatos de paginación',
    example: {
      total: 100,
      page: 1,
      limit: 10,
      totalPages: 10,
      hasNextPage: true,
      hasPreviousPage: false,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  constructor(partial: Partial<PaginatedUserResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO para métricas de registros
 */
export class RegistrationMetricsResponseDto {
  @ApiProperty({
    description: 'Total de registros',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Registros pendientes',
    example: 45,
  })
  pending: number;

  @ApiProperty({
    description: 'Registros en progreso',
    example: 30,
  })
  inProgress: number;

  @ApiProperty({
    description: 'Registros completados',
    example: 70,
  })
  completed: number;

  @ApiProperty({
    description: 'Registros fallidos',
    example: 5,
  })
  failed: number;

  @ApiProperty({
    description: 'Registros expirados',
    example: 3,
  })
  expired: number;

  @ApiProperty({
    description: 'Registros creados hoy',
    example: 8,
  })
  createdToday: number;

  @ApiProperty({
    description: 'Usuarios verificados',
    example: 65,
  })
  verified: number;

  @ApiProperty({
    description: 'Usuarios no verificados',
    example: 85,
  })
  unverified: number;

  constructor(partial: Partial<RegistrationMetricsResponseDto>) {
    Object.assign(this, partial);
  }
}
