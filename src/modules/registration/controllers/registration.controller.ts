/**
 * Controlador REST para el módulo de Registration
 * Expone endpoints HTTP para operaciones de registro y verificación
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RegistrationService } from '../services';
import { CreateUserDto, RegistrationResultResponseDto } from '../dto';

@ApiTags('registration')
@Controller('registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  /**
   * Registra un nuevo usuario
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
    description: 'Crea una nueva cuenta de usuario en el sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: RegistrationResultResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'El email o username ya está registrado',
    type: RegistrationResultResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
    type: RegistrationResultResponseDto,
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Datos del usuario a registrar',
  })
  async registerUser(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<RegistrationResultResponseDto> {
    const result = await this.registrationService.registerUser(createUserDto);
    return new RegistrationResultResponseDto(result);
  }

  /**
   * Verifica la cuenta de un usuario
   */
  @Get('verify/:token')
  @ApiOperation({
    summary: 'Verificar cuenta de usuario',
    description:
      'Verifica la cuenta de usuario usando un token de verificación',
  })
  @ApiParam({
    name: 'token',
    description: 'Token de verificación enviado por email',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiResponse({
    status: 200,
    description: 'Cuenta verificada exitosamente',
    type: RegistrationResultResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido o cuenta ya verificada',
    type: RegistrationResultResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
    type: RegistrationResultResponseDto,
  })
  async verifyUserAccount(
    @Param('token') token: string,
  ): Promise<RegistrationResultResponseDto> {
    const result = await this.registrationService.verifyUserAccount(token);
    return new RegistrationResultResponseDto(result);
  }

  /**
   * Reenvía el correo de verificación
   */
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reenviar correo de verificación',
    description: 'Reenvía el correo de verificación a un usuario existente',
  })
  @ApiResponse({
    status: 200,
    description: 'Correo de verificación reenviado exitosamente',
    type: RegistrationResultResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cuenta ya verificada',
    type: RegistrationResultResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
    type: RegistrationResultResponseDto,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'Email del usuario',
          example: 'usuario@example.com',
        },
      },
      required: ['email'],
    },
  })
  async resendVerification(
    @Body('email', ValidationPipe) email: string,
  ): Promise<RegistrationResultResponseDto> {
    const result = await this.registrationService.resendVerification(email);
    return new RegistrationResultResponseDto(result);
  }
}
