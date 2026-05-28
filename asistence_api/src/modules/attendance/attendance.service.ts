import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, AttendanceStatus } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

// Coordenadas simuladas de la oficina central del IIAP (Iquitos, por ejemplo)
// -3.7533, -73.2675 (Aproximación para Iquitos)
const OFFICE_LAT = -3.7533;
const OFFICE_LNG = -73.2675;
const MAX_DISTANCE_METERS = 500; // Radio permitido de marcación en metros

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  // Fórmula de Haversine para calcular distancia real entre dos coordenadas en metros
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async create(userId: string, createAttendanceDto: CreateAttendanceDto) {
    const { latitude, longitude, type, ...rest } = createAttendanceDto;

    // 1. Evaluar ubicación (Geofencing)
    const distance = this.calculateDistance(latitude, longitude, OFFICE_LAT, OFFICE_LNG);
    
    if (distance > MAX_DISTANCE_METERS) {
      throw new BadRequestException(`Estás fuera del rango permitido para marcar asistencia. Distancia actual: ${Math.round(distance)}m. Rango máximo: ${MAX_DISTANCE_METERS}m.`);
    }

    // 2. Determinar estado de puntualidad (Ejemplo básico)
    // En un sistema real se evaluaría contra el 'Schedule' asignado al usuario
    let status = AttendanceStatus.ON_TIME;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Regla de ejemplo: El Check-In es hasta las 08:15 AM
    if (type === 'CHECK_IN') {
      if (currentHour > 8 || (currentHour === 8 && currentMinute > 15)) {
        status = AttendanceStatus.LATE;
      }
    }

    // 3. Crear y guardar el registro
    const attendance = this.attendanceRepository.create({
      user_id: userId,
      type,
      latitude,
      longitude,
      status,
      ...rest,
    });

    await this.attendanceRepository.save(attendance);

    return {
      message: 'Asistencia registrada correctamente',
      data: {
        id: attendance.id,
        type: attendance.type,
        status: attendance.status,
        timestamp: attendance.timestamp,
        distance_meters: Math.round(distance)
      }
    };
  }

  // Historial personal para el empleado (App Móvil)
  async getUserHistory(userId: string) {
    return this.attendanceRepository.find({
      where: { user_id: userId },
      order: { timestamp: 'DESC' },
      take: 50, // Trae las últimas 50 marcaciones por defecto
    });
  }

  // Reporte general para el administrador (Panel Web)
  async getAllHistory(limit: number = 100) {
    return this.attendanceRepository.find({
      relations: ['user'], // Hace un JOIN con la tabla de usuarios
      order: { timestamp: 'DESC' },
      take: limit,
      select: {
        id: true,
        type: true,
        status: true,
        timestamp: true,
        latitude: true,
        longitude: true,
        observations: true,
        user: {
          id: true,
          full_name: true,
          document_number: true,
          department: true,
        }
      }
    });
  }
}
