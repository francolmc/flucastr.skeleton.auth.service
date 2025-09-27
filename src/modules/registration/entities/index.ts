/**
 * Exportaciones centralizadas de entidades del módulo Registration
 */

export { UserRegistration } from './user-registration.entity';
export { RegistrationResult } from './registration-result.entity';
export {
  RegistrationStatus,
  REGISTRATION_STATUS_VALUES,
  type RegistrationFilters,
  type RegistrationMetrics,
  type PaginationOptions,
  type PaginatedResponse,
  type CreateUserData,
  type UpdateUserData,
} from './types';
