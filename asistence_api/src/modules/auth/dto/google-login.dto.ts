import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'El Token de Identidad (ID Token) emitido por Google para el cliente autenticado.',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE... (Token de Google)',
  })
  @IsString({ message: 'El idToken debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El idToken es obligatorio para iniciar sesión con Google.' })
  idToken: string;
}
