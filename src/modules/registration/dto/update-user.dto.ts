/**
 * DTO para actualizar un usuario existente
 */

import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Email del usuario (debe ser único)',
    example: 'nuevoemail@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @Transform(({ value }: { value?: string }) => value?.toLowerCase().trim())
  email?: string;

  @ApiPropertyOptional({
    description: 'Nombre de usuario opcional (debe ser único)',
    example: 'nuevousuario123',
    minLength: 3,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(3, 50, {
    message: 'El nombre de usuario debe tener entre 3 y 50 caracteres',
  })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos',
  })
  @Transform(({ value }: { value?: string }) => value?.trim())
  username?: string;

  @ApiPropertyOptional({
    description: 'Nombre del usuario',
    example: 'Juan Carlos',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100, {
    message: 'El nombre debe tener entre 1 y 100 caracteres',
  })
  @Transform(({ value }: { value?: string }) => value?.trim())
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Apellido del usuario',
    example: 'Pérez García',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100, {
    message: 'El apellido debe tener entre 1 y 100 caracteres',
  })
  @Transform(({ value }: { value?: string }) => value?.trim())
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Nueva contraseña del usuario',
    example: 'NuevaContraseñaSegura456!',
    minLength: 8,
    maxLength: 128,
  })
  @IsOptional()
  @IsString()
  @Length(8, 128, {
    message: 'La contraseña debe tener entre 8 y 128 caracteres',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial',
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'Indica si el usuario está activo',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el usuario está verificado',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
