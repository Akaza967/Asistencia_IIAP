import { IsUUID, IsInt, Min, Max, Matches, IsNotEmpty } from 'class-validator';

export class CreateScheduleDto {
  @IsUUID('4', { message: 'El id de usuario debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El id de usuario es obligatorio.' })
  user_id: string;

  @IsInt({ message: 'El día de la semana debe ser un número entero.' })
  @Min(0, { message: 'El día de la semana debe ser como mínimo 0 (Domingo).' })
  @Max(6, { message: 'El día de la semana debe ser como máximo 6 (Sábado).' })
  @IsNotEmpty({ message: 'El día de la semana es obligatorio.' })
  day_of_week: number;

  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/, {
    message: 'La hora de inicio debe tener el formato HH:MM o HH:MM:SS.',
  })
  @IsNotEmpty({ message: 'La hora de inicio es obligatoria.' })
  start_time: string;

  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/, {
    message: 'La hora de fin debe tener el formato HH:MM o HH:MM:SS.',
  })
  @IsNotEmpty({ message: 'La hora de fin es obligatoria.' })
  end_time: string;
}
