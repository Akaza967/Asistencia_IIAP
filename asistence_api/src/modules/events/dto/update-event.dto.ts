import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateEventDto {
  @IsString({ message: 'El título del evento debe ser una cadena de texto.' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'La fecha de inicio debe tener un formato de fecha válido.' })
  @IsOptional()
  start_date?: Date;

  @IsDateString({}, { message: 'La fecha de fin debe tener un formato de fecha válido.' })
  @IsOptional()
  end_date?: Date;
}
