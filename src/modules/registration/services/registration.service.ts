/**
 * Servicio para el módulo de Registration
 * Contiene la lógica de negocio del registro de usuarios
 */

import {
  Injectable,
  Logger,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { RegistrationRepository } from '../repository';
import { RegistrationServiceInterface } from '../interfaces';
import { RegistrationResult, RegistrationStatus } from '../entities';
import { CreateUserData } from '../entities/types';

@Injectable()
export class RegistrationService implements RegistrationServiceInterface {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    private readonly registrationRepository: RegistrationRepository,
  ) {}

  /**
   * Registra un nuevo usuario en el sistema
   */
  async registerUser(data: CreateUserData): Promise<RegistrationResult> {
    this.logger.log(`Registering user: ${data.email}`);

    try {
      // Validar que el email no esté registrado
      const existingUser = await this.registrationRepository.findByEmail(
        data.email,
      );
      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }

      // Validar username si se proporciona
      if (data.username) {
        const existingUsername =
          await this.registrationRepository.findByUsername(data.username);
        if (existingUsername) {
          throw new ConflictException('El nombre de usuario ya está en uso');
        }
      }

      // TODO: Hash de la contraseña
      // const hashedPassword = await this.hashPassword(data.password);
      const hashedPassword = data.password; // Temporal hasta implementar hash

      const createData: CreateUserData = {
        ...data,
        password: hashedPassword,
      };

      // Crear el usuario
      const user = await this.registrationRepository.create(createData);

      // TODO: Generar token de verificación
      const verificationToken = this.generateVerificationToken();

      // TODO: Enviar email de verificación
      // await this.emailService.sendVerificationEmail(user.email, verificationToken);

      const result = new RegistrationResult({
        success: true,
        message:
          'Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.',
        userId: user.id,
        email: user.email,
        status: RegistrationStatus.COMPLETED,
        verificationToken,
      });

      this.logger.log(
        `User registered successfully: ${user.id} - ${user.email}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Error registering user ${data.email}:`, error);

      const result = new RegistrationResult({
        success: false,
        message:
          error instanceof Error ? error.message : 'Error interno del servidor',
        email: data.email,
        status: RegistrationStatus.FAILED,
      });

      if (error instanceof ConflictException) {
        result.addError(error.message);
      }

      return result;
    }
  }

  /**
   * Verifica la cuenta de un usuario a través de un token
   */
  async verifyUserAccount(token: string): Promise<RegistrationResult> {
    this.logger.log(
      `Verifying user account with token: ${token.substring(0, 10)}...`,
    );

    try {
      // TODO: Validar y decodificar el token JWT
      // const payload = await this.jwtService.verify(token);
      // const userId = payload.userId;

      // Simulación temporal - en producción esto vendría del token
      const userId = 'temp-user-id'; // TODO: Extraer del token

      if (!userId) {
        throw new BadRequestException('Token de verificación inválido');
      }

      // Buscar el usuario
      const user = await this.registrationRepository.findById(userId);
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (user.isVerified) {
        throw new BadRequestException('La cuenta ya está verificada');
      }

      // Actualizar el estado de verificación
      const updatedUser = await this.registrationRepository.update(userId, {
        isVerified: true,
      });

      const result = new RegistrationResult({
        success: true,
        message: 'Cuenta verificada exitosamente',
        userId: updatedUser.id,
        email: updatedUser.email,
        status: RegistrationStatus.COMPLETED,
      });

      this.logger.log(`User account verified: ${updatedUser.id}`);
      return result;
    } catch (error) {
      this.logger.error('Error verifying user account:', error);

      const result = new RegistrationResult({
        success: false,
        message:
          error instanceof Error ? error.message : 'Error interno del servidor',
        status: RegistrationStatus.FAILED,
      });

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        result.addError(error.message);
      }

      return result;
    }
  }

  /**
   * Reenvía el correo de verificación a un usuario
   */
  async resendVerification(email: string): Promise<RegistrationResult> {
    this.logger.log(`Resending verification email to: ${email}`);

    try {
      // Buscar el usuario por email
      const user = await this.registrationRepository.findByEmail(email);
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (user.isVerified) {
        throw new BadRequestException('La cuenta ya está verificada');
      }

      // TODO: Generar nuevo token de verificación
      const verificationToken = this.generateVerificationToken();

      // TODO: Enviar email de verificación
      // await this.emailService.sendVerificationEmail(user.email, verificationToken);

      const result = new RegistrationResult({
        success: true,
        message: 'Correo de verificación reenviado exitosamente',
        userId: user.id,
        email: user.email,
        status: RegistrationStatus.PENDING,
        verificationToken,
      });

      this.logger.log(`Verification email resent to: ${user.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Error resending verification to ${email}:`, error);

      const result = new RegistrationResult({
        success: false,
        message:
          error instanceof Error ? error.message : 'Error interno del servidor',
        email,
        status: RegistrationStatus.FAILED,
      });

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        result.addError(error.message);
      }

      return result;
    }
  }

  /**
   * TODO: Implementar hash de contraseña
   * Método temporal - debe reemplazarse con bcrypt u otra librería de hash
   */
  private async hashPassword(password: string): Promise<string> {
    // TODO: Implementar hash real
    // return await bcrypt.hash(password, 12);
    return password;
  }

  /**
   * TODO: Implementar generación de token JWT
   * Método temporal - debe reemplazarse con JWT real
   */
  private generateVerificationToken(): string {
    // TODO: Implementar token JWT real
    // const payload = { userId: user.id, type: 'email_verification' };
    // return this.jwtService.sign(payload, { expiresIn: '24h' });
    return `verification-token-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }
}
