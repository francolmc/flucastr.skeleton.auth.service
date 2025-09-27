/**
 * Enums y tipos para el módulo de Registration
 */

export enum RegistrationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

export const REGISTRATION_STATUS_VALUES = Object.values(RegistrationStatus);

/**
 * Tipo para filtros de búsqueda de registros
 */
export interface RegistrationFilters {
  status?: RegistrationStatus;
  startDate?: Date;
  endDate?: Date;
  email?: string;
  tenantId?: string;
}

/**
 * Tipo para métricas de registros
 */
export interface RegistrationMetrics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
  expired: number;
  createdToday: number;
  verified: number;
  unverified: number;
}

/**
 * Tipo para opciones de paginación
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Tipo para respuesta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Tipo para datos de creación de usuario
 */
export interface CreateUserData {
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  password: string;
  tenantId?: string;
}

/**
 * Tipo para datos de actualización de usuario
 */
export interface UpdateUserData {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  isActive?: boolean;
  isVerified?: boolean;
}
