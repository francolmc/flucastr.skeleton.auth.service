import { ApiProperty } from '@nestjs/swagger';

export class RefreshResponseDto {
  @ApiProperty({
    description: 'Nuevo token de acceso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Nuevo token de renovación JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Tipo de token',
    example: 'bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Tiempo de expiración del token de acceso en segundos',
    example: 3600,
  })
  expiresIn: number;
}
