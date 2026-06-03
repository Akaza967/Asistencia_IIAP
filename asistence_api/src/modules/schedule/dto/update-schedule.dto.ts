import { IsInt, Min, Max, Matches, IsOptional } from 'class-validator';

export class UpdateScheduleDto {
  @IsInt({ message: 'El día de la semana debe ser un número entero.' })
  @Min(0, { message: 'El día de la semana debe ser como mínimo 0 (Domingo).' })
  @Max(6, { message: 'El día de la semana debe ser como máximo 6 (Sábado).' })
  @IsOptional()
  day_of_week?: number;

  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/, {
    message: 'La hora de inicio debe tener el formato HH:MM o HH:MM:SS.',
  })
  @IsOptional()
  start_time?: string;

  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/, {
    message: 'La hora de fin debe tener el formato HH:MM o HH:MM:SS.',
  })
  @IsOptional()
  end_time?: string;
}
