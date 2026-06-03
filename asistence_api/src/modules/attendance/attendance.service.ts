import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, AttendanceStatus, AttendanceVerificationMethod } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { ScheduleService } from '../schedule/schedule.service';
import { ProjectsService } from '../projects/projects.service';
import { ProjectStatus } from '../projects/entities/project.entity';

// Coordenadas simuladas de la oficina central del IIAP (Iquitos, por ejemplo)
// -3.7533, -73.2675 (Aproximación para Iquitos)
const OFFICE_LAT = -3.7533;
const OFFICE_LNG = -73.2675;
const MAX_DISTANCE_METERS = 500; // Radio permitido de marcación en metros
const TOLERANCE_SECONDS = 15 * 60; // Tolerancia de 15 minutos para Check-In (en segundos)

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly scheduleService: ScheduleService,
    private readonly projectsService: ProjectsService,
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

  // Convertir formato de hora HH:MM:SS o HH:MM a segundos transcurridos desde medianoche
  private timeToSeconds(timeStr: string): number {
    const parts = timeStr.split(':').map(Number);
    const hrs = parts[0] || 0;
    const mins = parts[1] || 0;
    const secs = parts[2] || 0;
    return hrs * 3600 + mins * 60 + secs;
  }

  async create(targetUserId: string, operatorId: string, createAttendanceDto: CreateAttendanceDto) {
    const { latitude, longitude, type, project_id, verification_method, ...rest } = createAttendanceDto;

    // 1. Evaluar ubicación (Geofencing)
    const distance = this.calculateDistance(latitude, longitude, OFFICE_LAT, OFFICE_LNG);
    
    if (distance > MAX_DISTANCE_METERS) {
      throw new BadRequestException(`Estás fuera del rango permitido para marcar asistencia. Distancia actual: ${Math.round(distance)}m. Rango máximo: ${MAX_DISTANCE_METERS}m.`);
    }

    // 2. Validar que el proyecto existe y está activo si se suministra un project_id
    if (project_id) {
      const project = await this.projectsService.findOne(project_id);
      if (project.status !== ProjectStatus.ACTIVE) {
        throw new BadRequestException('El proyecto seleccionado no se encuentra activo y no admite registros de asistencia.');
      }
    }

    // 3. Determinar estado de puntualidad dinámico contra el horario (Schedule)
    let status = AttendanceStatus.ON_TIME;
    let scheduleId: string | null = null;
    let generatedObservations = '';

    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 = Domingo, 1 = Lunes, etc.

    // Obtener los horarios semanales del usuario
    const userSchedules = await this.scheduleService.findByUser(targetUserId);
    const todaySchedule = userSchedules.find(s => s.day_of_week === currentDayOfWeek);

    if (!todaySchedule) {
      // El empleado no tiene horario configurado para hoy (ej. fin de semana o día no asignado)
      status = AttendanceStatus.PENDING_REVIEW;
      generatedObservations = 'Marcación fuera de horario programado (sin horario asignado para el día de hoy).';
    } else {
      scheduleId = todaySchedule.id;

      // Calcular segundos desde medianoche de la marcación actual
      const markSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      
      const startSeconds = this.timeToSeconds(todaySchedule.start_time);
      const endSeconds = this.timeToSeconds(todaySchedule.end_time);

      if (type === 'CHECK_IN') {
        // Tardanza si marca después del inicio + tolerancia
        if (markSeconds > startSeconds + TOLERANCE_SECONDS) {
          status = AttendanceStatus.LATE;
          generatedObservations = `Tardanza: Marcación realizada a las ${now.toLocaleTimeString()}, el límite con tolerancia era ${new Date(now.setHours(Math.floor((startSeconds + TOLERANCE_SECONDS) / 3600), Math.floor(((startSeconds + TOLERANCE_SECONDS) % 3600) / 60), 0)).toLocaleTimeString()}.`;
        }
      } else if (type === 'CHECK_OUT') {
        // Salida antes de tiempo si marca antes del fin de jornada
        if (markSeconds < endSeconds) {
          status = AttendanceStatus.EARLY_DEPARTURE;
          generatedObservations = `Salida antes de tiempo: Marcación a las ${now.toLocaleTimeString()}, el horario de salida es a las ${todaySchedule.end_time}.`;
        }
      }
    }

    // Unir observaciones manuales y generadas
    const finalObservations = rest.observations 
      ? `${rest.observations} | ${generatedObservations}`.trim()
      : generatedObservations;

    // 4. Crear y guardar el registro
    const attendance = this.attendanceRepository.create({
      user_id: targetUserId,
      type,
      latitude,
      longitude,
      status,
      schedule_id: scheduleId,
      project_id: project_id || null,
      observations: finalObservations || null,
      verification_method: verification_method || AttendanceVerificationMethod.MANUAL,
      marked_by_id: targetUserId === operatorId ? null : operatorId,
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
        schedule_id: attendance.schedule_id,
        project_id: attendance.project_id,
        distance_meters: Math.round(distance),
        observations: attendance.observations,
        verification_method: attendance.verification_method,
        marked_by_id: attendance.marked_by_id,
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
        schedule_id: true,
        project_id: true,
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
