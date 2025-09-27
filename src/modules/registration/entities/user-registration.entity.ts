/**
 * Entidad UserRegistration - Representa un usuario en el sistema
 * Basada en el modelo Prisma User
 */

export class UserRegistration {
  /**
   * Identificador único del usuario
   */
  id: string;

  /**
   * Email del usuario (único)
   */
  email: string;

  /**
   * Nombre de usuario opcional (único)
   */
  username?: string;

  /**
   * Nombre del usuario
   */
  firstName?: string;

  /**
   * Apellido del usuario
   */
  lastName?: string;

  /**
   * Contraseña del usuario (encriptada)
   */
  password: string;

  /**
   * Indica si el usuario está activo
   */
  isActive: boolean;

  /**
   * Indica si el usuario está verificado
   */
  isVerified: boolean;

  /**
   * ID del tenant para soporte multi-tenant
   */
  tenantId?: string;

  /**
   * Fecha de creación del usuario
   */
  createdAt: Date;

  /**
   * Fecha de última actualización del usuario
   */
  updatedAt: Date;

  /**
   * Fecha del último inicio de sesión
   */
  lastLoginAt?: Date;

  constructor(partial: Partial<UserRegistration>) {
    Object.assign(this, partial);
  }

  /**
   * Verifica si el usuario está activo
   */
  isActiveUser(): boolean {
    return this.isActive;
  }

  /**
   * Verifica si el usuario está verificado
   */
  isVerifiedUser(): boolean {
    return this.isVerified;
  }

  /**
   * Verifica si el usuario está completamente activo y verificado
   */
  isFullyActive(): boolean {
    return this.isActive && this.isVerified;
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  getFullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.username || this.email;
  }

  /**
   * Verifica si el usuario ha iniciado sesión alguna vez
   */
  hasLoggedInBefore(): boolean {
    return this.lastLoginAt !== undefined;
  }

  /**
   * Obtiene el nombre para mostrar (prioriza username, luego fullName, luego email)
   */
  getDisplayName(): string {
    return this.username || this.getFullName();
  }
}
