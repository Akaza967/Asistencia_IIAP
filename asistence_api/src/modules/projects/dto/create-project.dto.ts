import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateProjectDto {
  @IsString({ message: 'El nombre del proyecto debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre del proyecto es obligatorio.' })
  @Length(3, 100, { message: 'El nombre del proyecto debe tener entre 3 y 100 caracteres.' })
  name: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsOptional()
  description?: string;
}
