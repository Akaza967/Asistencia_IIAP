import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateEventDto {
  @IsString({ message: 'El título del evento debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El título del evento es obligatorio.' })
  title: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'La fecha de inicio debe tener un formato de fecha válido.' })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria.' })
  start_date: Date;

  @IsDateString({}, { message: 'La fecha de fin debe tener un formato de fecha válido.' })
  @IsNotEmpty({ message: 'La fecha de fin es obligatoria.' })
  end_date: Date;
}
