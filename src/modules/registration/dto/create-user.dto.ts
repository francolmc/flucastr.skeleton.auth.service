/**
 * DTO para crear un nuevo usuario
 */

import {
  IsString,
  IsOptional,
  IsEmail,
  Length,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email del usuario (debe ser único)',
    example: 'usuario@example.com',
  })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string;

  @ApiPropertyOptional({
    description: 'Nombre de usuario opcional (debe ser único)',
    example: 'usuario123',
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
    example: 'Juan',
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
    example: 'Pérez',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100, {
    message: 'El apellido debe tener entre 1 y 100 caracteres',
  })
  @Transform(({ value }: { value?: string }) => value?.trim())
  lastName?: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'ContraseñaSegura123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 128, {
    message: 'La contraseña debe tener entre 8 y 128 caracteres',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'ID del tenant para soporte multi-tenant',
    example: 'tenant-123',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.trim())
  tenantId?: string;
}
