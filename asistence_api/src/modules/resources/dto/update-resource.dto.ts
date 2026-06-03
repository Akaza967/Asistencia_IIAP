import { IsString, IsOptional, Length, IsEnum } from 'class-validator';
import { ResourceStatus } from '../entities/resource.entity';

export class UpdateResourceDto {
  @IsString({ message: 'El código de activo debe ser una cadena de texto.' })
  @Length(3, 30, { message: 'El código de activo debe tener entre 3 y 30 caracteres.' })
  @IsOptional()
  code?: string;

  @IsString({ message: 'El nombre del recurso debe ser una cadena de texto.' })
  @Length(3, 100, { message: 'El nombre del recurso debe tener entre 3 y 100 caracteres.' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'El tipo de recurso debe ser una cadena de texto.' })
  @IsOptional()
  type?: string;

  @IsEnum(ResourceStatus, { message: 'El estado del recurso no es válido.' })
  @IsOptional()
  status?: ResourceStatus;
}
