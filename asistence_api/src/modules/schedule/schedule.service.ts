import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { User } from '../users/entities/user.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Crear un horario para un usuario
  async create(createScheduleDto: CreateScheduleDto) {
    const { user_id, day_of_week, start_time, end_time } = createScheduleDto;

    // 1. Validar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id: user_id } });
    if (!user) {
      throw new NotFoundException('El usuario especificado no existe.');
    }

    // 2. Validar que el usuario no tenga ya un horario asignado para el mismo día de la semana
    const existingSchedule = await this.scheduleRepository.findOne({
      where: { user_id, day_of_week },
    });
    if (existingSchedule) {
      throw new BadRequestException(
        `El usuario ya tiene un horario asignado para el día ${this.getDayName(day_of_week)}. Por favor, edite el horario existente.`
      );
    }

    // 3. Validar consistencia horaria (inicio antes de fin)
    if (start_time >= end_time) {
      throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin.');
    }

    // 4. Guardar
    const schedule = this.scheduleRepository.create(createScheduleDto);
    await this.scheduleRepository.save(schedule);

    return {
      message: 'Horario creado y asignado correctamente.',
      data: schedule,
    };
  }

  // Listar todos los horarios del sistema
  async findAll() {
    return this.scheduleRepository.find({
      relations: ['user'],
      order: {
        user: { full_name: 'ASC' },
        day_of_week: 'ASC',
      },
    });
  }

  // Buscar todos los horarios de un usuario específico
  async findByUser(userId: string) {
    // Validar usuario
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('El usuario especificado no existe.');
    }

    return this.scheduleRepository.find({
      where: { user_id: userId },
      order: { day_of_week: 'ASC' },
    });
  }

  // Buscar un horario por su ID
  async findOne(id: string) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!schedule) {
      throw new NotFoundException('El horario especificado no existe.');
    }

    return schedule;
  }

  // Modificar un horario existente
  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    const schedule = await this.findOne(id);
    const { day_of_week, start_time, end_time } = updateScheduleDto;

    // 1. Si cambia el día de la semana, validar duplicados
    if (day_of_week !== undefined && day_of_week !== schedule.day_of_week) {
      const existingDaySchedule = await this.scheduleRepository.findOne({
        where: { user_id: schedule.user_id, day_of_week },
      });
      if (existingDaySchedule) {
        throw new BadRequestException(
          `El usuario ya tiene un horario asignado para el día ${this.getDayName(day_of_week)}.`
        );
      }
    }

    // 2. Validar consistencia horaria si se actualizan tiempos
    const finalStart = start_time !== undefined ? start_time : schedule.start_time;
    const finalEnd = end_time !== undefined ? end_time : schedule.end_time;

    if (finalStart >= finalEnd) {
      throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin.');
    }

    // 3. Modificar
    Object.assign(schedule, updateScheduleDto);
    await this.scheduleRepository.save(schedule);

    return {
      message: 'Horario actualizado correctamente.',
      data: schedule,
    };
  }

  // Eliminar un horario
  async remove(id: string) {
    const schedule = await this.findOne(id);
    await this.scheduleRepository.remove(schedule);
    return {
      message: 'Horario eliminado con éxito.',
    };
  }

  // Helper para obtener nombres de días en español
  private getDayName(day: number): string {
    const days = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    return days[day] || 'Desconocido';
  }
}
