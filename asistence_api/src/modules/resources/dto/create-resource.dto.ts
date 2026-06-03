import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateResourceDto {
  @IsString({ message: 'El código de activo debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El código de activo es obligatorio.' })
  @Length(3, 30, { message: 'El código de activo debe tener entre 3 y 30 caracteres.' })
  code: string;

  @IsString({ message: 'El nombre del recurso debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre del recurso es obligatorio.' })
  @Length(3, 100, { message: 'El nombre del recurso debe tener entre 3 y 100 caracteres.' })
  name: string;

  @IsString({ message: 'El tipo de recurso debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El tipo de recurso es obligatorio (ej: EQUIPMENT, VEHICLE, TOOL).' })
  type: string;
}
