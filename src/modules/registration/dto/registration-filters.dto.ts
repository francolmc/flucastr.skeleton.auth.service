/**
 * DTOs para filtros y búsquedas de registros de usuario
 */

import {
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RegistrationStatus } from '../entities/types';

export class RegistrationFiltersDto {
  @ApiProperty({
    description: 'Filtrar por estado del registro',
    enum: RegistrationStatus,
    required: false,
    example: RegistrationStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(RegistrationStatus)
  status?: RegistrationStatus;

  @ApiProperty({
    description: 'Fecha de inicio para filtrar registros (ISO 8601)',
    required: false,
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Fecha de fin para filtrar registros (ISO 8601)',
    required: false,
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Filtrar por email del usuario',
    required: false,
    example: 'usuario@example.com',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.toLowerCase().trim())
  email?: string;

  @ApiProperty({
    description: 'Filtrar por ID del tenant',
    required: false,
    example: 'tenant-123',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.trim())
  tenantId?: string;
}

export class PaginationDto {
  @ApiProperty({
    description: 'Número de página (comenzando desde 1)',
    minimum: 1,
    default: 1,
    required: false,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Número de elementos por página',
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Campo por el cual ordenar',
    enum: ['id', 'email', 'status', 'createdAt', 'updatedAt'],
    default: 'createdAt',
    required: false,
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['id', 'email', 'status', 'createdAt', 'updatedAt'])
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Orden de clasificación',
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false,
    example: 'desc',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class RegistrationSearchDto extends PaginationDto {
  @ApiProperty({
    description: 'Filtrar por estado del registro',
    enum: RegistrationStatus,
    required: false,
    example: RegistrationStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(RegistrationStatus)
  status?: RegistrationStatus;

  @ApiProperty({
    description: 'Fecha de inicio para filtrar registros (ISO 8601)',
    required: false,
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Fecha de fin para filtrar registros (ISO 8601)',
    required: false,
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Filtrar por email del usuario',
    required: false,
    example: 'usuario@example.com',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.toLowerCase().trim())
  email?: string;

  @ApiProperty({
    description: 'Filtrar por ID del tenant',
    required: false,
    example: 'tenant-123',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.trim())
  tenantId?: string;
}
