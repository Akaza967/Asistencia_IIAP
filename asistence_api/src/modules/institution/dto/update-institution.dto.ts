import { IsString, IsOptional, Length, IsBoolean } from 'class-validator';

export class UpdateInstitutionDto {
  @IsString({ message: 'El código de la sede debe ser una cadena de texto.' })
  @Length(3, 20, { message: 'El código debe tener entre 3 y 20 caracteres.' })
  @IsOptional()
  code?: string;

  @IsString({ message: 'El nombre de la sede debe ser una cadena de texto.' })
  @Length(3, 100, { message: 'El nombre debe tener entre 3 y 100 caracteres.' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'La dirección debe ser una cadena de texto.' })
  @IsOptional()
  address?: string;

  @IsBoolean({ message: 'El estado de activación debe ser un valor booleano.' })
  @IsOptional()
  is_active?: boolean;
}
