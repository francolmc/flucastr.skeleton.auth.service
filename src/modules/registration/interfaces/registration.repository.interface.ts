/**
 * Interfaz para el repositorio de registro de usuarios
 * Define el contrato para el acceso a datos de usuarios
 */

import { UserRegistration } from '../entities';
import { CreateUserData, UpdateUserData } from '../entities/types';

export interface RegistrationRepositoryInterface {
  /**
   * Crea un nuevo usuario en la base de datos
   * @param data - Datos para la creación del usuario
   * @returns El usuario creado
   */
  create(data: CreateUserData): Promise<UserRegistration>;

  /**
   * Busca un usuario por su email
   * @param email - Email del usuario a buscar
   * @returns El usuario encontrado o null
   */
  findByEmail(email: string): Promise<UserRegistration | null>;

  /**
   * Busca un usuario por su nombre de usuario
   * @param username - Nombre de usuario a buscar
   * @returns El usuario encontrado o null
   */
  findByUsername(username: string): Promise<UserRegistration | null>;

  /**
   * Busca un usuario por su ID
   * @param id - ID del usuario a buscar
   * @returns El usuario encontrado o null
   */
  findById(id: string): Promise<UserRegistration | null>;

  /**
   * Actualiza un usuario existente
   * @param id - ID del usuario a actualizar
   * @param data - Datos para actualizar
   * @returns El usuario actualizado
   */
  update(id: string, data: UpdateUserData): Promise<UserRegistration>;
}
