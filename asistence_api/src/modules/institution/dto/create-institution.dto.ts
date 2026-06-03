import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateInstitutionDto {
  @IsString({ message: 'El código de la sede debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El código de la sede es obligatorio.' })
  @Length(3, 20, { message: 'El código debe tener entre 3 y 20 caracteres.' })
  code: string;

  @IsString({ message: 'El nombre de la sede debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de la sede es obligatorio.' })
  @Length(3, 100, { message: 'El nombre debe tener entre 3 y 100 caracteres.' })
  name: string;

  @IsString({ message: 'La dirección debe ser una cadena de texto.' })
  @IsOptional()
  address?: string;
}
