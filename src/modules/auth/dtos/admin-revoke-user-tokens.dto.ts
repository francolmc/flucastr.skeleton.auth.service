import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AdminRevokeUserTokensDto {
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  @ApiProperty({
    description: 'ID del usuario cuyos tokens serán revocados',
    example: 'cmg32kf5z0000d55o3gox11za',
  })
  userId: string;
}
