import { IsString, IsOptional, IsDateString, IsUrl, Length } from 'class-validator';

export class UpdateUserDto {
  @IsString({ message: 'El nombre completo debe ser una cadena de texto.' })
  @IsOptional()
  full_name?: string;

  @IsString({ message: 'El número de documento debe ser una cadena de texto.' })
  @Length(8, 20, { message: 'El documento debe tener entre 8 y 20 caracteres.' })
  @IsOptional()
  document_number?: string;

  @IsString({ message: 'El número de teléfono debe ser una cadena de texto.' })
  @IsOptional()
  phone_number?: string;

  @IsDateString({}, { message: 'La fecha de nacimiento debe tener un formato de fecha válido (YYYY-MM-DD).' })
  @IsOptional()
  date_of_birth?: Date;

  @IsString({ message: 'La URL de la foto debe ser una cadena de texto.' })
  @IsUrl({}, { message: 'La foto debe ser una URL válida.' })
  @IsOptional()
  photo_url?: string;

  @IsString({ message: 'El cargo debe ser una cadena de texto.' })
  @IsOptional()
  position?: string;

  @IsString({ message: 'El departamento debe ser una cadena de texto.' })
  @IsOptional()
  department?: string;
}
