/**
 * Interfaz para el servicio de registro de usuarios
 * Define el contrato para la lógica de negocio del registro
 */

import { RegistrationResult } from '../entities';
import { CreateUserData } from '../entities/types';

export interface RegistrationServiceInterface {
  /**
   * Registra un nuevo usuario en el sistema
   * @param data - Datos para el registro del usuario
   * @returns El resultado del proceso de registro
   */
  registerUser(data: CreateUserData): Promise<RegistrationResult>;

  /**
   * Verifica la cuenta de un usuario a través de un token
   * @param token - Token de verificación
   * @returns El resultado de la verificación
   */
  verifyUserAccount(token: string): Promise<RegistrationResult>;

  /**
   * Reenvía el correo de verificación a un usuario
   * @param email - Email del usuario
   * @returns El resultado del reenvío
   */
  resendVerification(email: string): Promise<RegistrationResult>;
}
