import { IsString, IsOptional, Length, IsEnum } from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';

export class UpdateProjectDto {
  @IsString({ message: 'El nombre del proyecto debe ser una cadena de texto.' })
  @Length(3, 100, { message: 'El nombre del proyecto debe tener entre 3 y 100 caracteres.' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsOptional()
  description?: string;

  @IsEnum(ProjectStatus, { message: 'El estado del proyecto no es válido.' })
  @IsOptional()
  status?: ProjectStatus;
}
