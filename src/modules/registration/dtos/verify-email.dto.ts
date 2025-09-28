// dtos/verify-email.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Verification token sent to user email',
    example: 'abc123def456',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
