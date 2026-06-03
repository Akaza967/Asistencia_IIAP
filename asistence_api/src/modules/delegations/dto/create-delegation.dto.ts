import { IsNotEmpty, IsUUID, IsDateString } from 'class-validator';

export class CreateDelegationDto {
  @IsUUID('4', { message: 'El ID del delegado debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID del delegado es obligatorio.' })
  delegatee_id: string;

  @IsDateString({}, { message: 'La fecha de inicio debe ser una cadena de fecha válida.' })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria.' })
  start_date: string;

  @IsDateString({}, { message: 'La fecha de fin debe ser una cadena de fecha válida.' })
  @IsNotEmpty({ message: 'La fecha de fin es obligatoria.' })
  end_date: string;
}
