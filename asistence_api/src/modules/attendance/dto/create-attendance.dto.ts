import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { AttendanceType, AttendanceVerificationMethod } from '../entities/attendance.entity';

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

  @IsString({ message: 'El id del proyecto debe ser una cadena de texto.' })
  @IsOptional()
  project_id?: string;

  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido.' })
  @IsOptional()
  user_id?: string;

  @IsEnum(AttendanceVerificationMethod, { message: 'El método de verificación no es válido.' })
  @IsOptional()
  verification_method?: AttendanceVerificationMethod;
}
