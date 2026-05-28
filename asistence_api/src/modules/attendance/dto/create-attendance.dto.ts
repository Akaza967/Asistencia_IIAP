import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AttendanceType } from '../entities/attendance.entity';

export class CreateAttendanceDto {
  @IsEnum(AttendanceType, { message: 'El tipo de asistencia no es válido' })
  @IsNotEmpty({ message: 'El tipo de asistencia es obligatorio' })
  type: AttendanceType;

  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @IsNotEmpty({ message: 'La latitud es obligatoria para verificar la ubicación' })
  latitude: number;

  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @IsNotEmpty({ message: 'La longitud es obligatoria para verificar la ubicación' })
  longitude: number;

  @IsString()
  @IsOptional()
  photo_url?: string;

  @IsString()
  @IsOptional()
  device_id?: string;

  @IsString()
  @IsOptional()
  observations?: string;
}
