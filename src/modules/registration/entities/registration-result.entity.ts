/**
 * Entidad RegistrationResult - Representa el resultado del proceso de registro
 */

import { RegistrationStatus } from './types';

export class RegistrationResult {
  /**
   * Indica si el registro fue exitoso
   */
  success: boolean;

  /**
   * Mensaje descriptivo del resultado
   */
  message: string;

  /**
   * ID del usuario registrado (si fue exitoso)
   */
  userId?: string;

  /**
   * Email del usuario registrado
   */
  email: string;

  /**
   * Estado del registro
   */
  status: RegistrationStatus;

  /**
   * Token de verificación (si aplica)
   */
  verificationToken?: string;

  /**
   * Lista de errores (si hubo errores)
   */
  errors?: string[];

  /**
   * Metadatos adicionales
   */
  metadata?: Record<string, any>;

  constructor(partial: Partial<RegistrationResult>) {
    Object.assign(this, partial);
  }

  /**
   * Verifica si el registro fue exitoso
   */
  isSuccessful(): boolean {
    return this.success;
  }

  /**
   * Verifica si hay errores
   */
  hasErrors(): boolean {
    return this.errors !== undefined && this.errors.length > 0;
  }

  /**
   * Obtiene el primer error (si existe)
   */
  getFirstError(): string | undefined {
    return this.errors?.[0];
  }

  /**
   * Agrega un error a la lista de errores
   */
  addError(error: string): void {
    if (!this.errors) {
      this.errors = [];
    }
    this.errors.push(error);
  }

  /**
   * Verifica si requiere verificación
   */
  requiresVerification(): boolean {
    return this.verificationToken !== undefined;
  }

  /**
   * Obtiene un resumen del resultado
   */
  getSummary(): string {
    if (this.success) {
      return `Registro exitoso para ${this.email}. Estado: ${this.status}`;
    }
    return `Registro fallido para ${this.email}: ${this.message}`;
  }
}
