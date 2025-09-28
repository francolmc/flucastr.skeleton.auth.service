// dtos/registration-response.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationResponseDto {
  @ApiProperty({
    description: 'Unique user identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    type: String,
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    type: String,
    required: false,
  })
  @Expose()
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    type: String,
    required: false,
  })
  @Expose()
  lastName?: string;

  @ApiProperty({
    description: 'Account active status',
    example: true,
    type: Boolean,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Email verification status',
    example: true,
    type: Boolean,
  })
  @Expose()
  emailVerified: boolean;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2023-12-01T10:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Account last update timestamp',
    example: '2023-12-01T10:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  updatedAt: Date;

  // Exclude sensitive fields
  @Exclude()
  password?: string;

  @Exclude()
  verificationToken?: string;

  @Exclude()
  verificationTokenExpiresAt?: Date;
}
