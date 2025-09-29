import { ApiProperty } from '@nestjs/swagger';

export class TokenIntrospectResponseDto {
  @ApiProperty({
    description: 'Whether the token is active/valid',
    example: true,
  })
  active: boolean;

  @ApiProperty({
    description: 'User ID associated with the token',
    example: 'cmg32kf5z0000d55o3gox11za',
    required: false,
  })
  sub?: string;

  @ApiProperty({
    description: 'Token issuer',
    example: 'flucastr-auth-service',
    required: false,
  })
  iss?: string;

  @ApiProperty({
    description: 'Token audience',
    example: 'flucastr-services',
    required: false,
  })
  aud?: string;

  @ApiProperty({
    description: 'Token expiration timestamp',
    example: 1638360000,
    required: false,
  })
  exp?: number;

  @ApiProperty({
    description: 'Token issued at timestamp',
    example: 1638273600,
    required: false,
  })
  iat?: number;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'User roles',
    example: ['user'],
    required: false,
  })
  roles?: string[];

  @ApiProperty({
    description: 'Token type',
    example: 'access',
    required: false,
  })
  token_type?: string;

  @ApiProperty({
    description: 'Error message if token is invalid',
    example: 'Token has expired',
    required: false,
  })
  error?: string;
}
