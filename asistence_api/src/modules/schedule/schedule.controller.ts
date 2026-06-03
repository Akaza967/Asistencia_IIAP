import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Horarios (Schedules)')
@ApiBearerAuth('JWT-auth')
@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // Crear un horario (solo ADMIN o SUPERADMIN)
  @Post()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  // Obtener todos los horarios registrados (solo ADMIN o SUPERADMIN)
  @Get()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async findAll() {
    return this.scheduleService.findAll();
  }

  // Obtener los horarios de un usuario específico (el propio usuario o administradores)
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string, @Request() req) {
    const isSelf = req.user.sub === userId;
    const isAdmin = req.user.role === UserRole.SUPERADMIN || req.user.role === UserRole.ADMIN;

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para consultar los horarios de este usuario.');
    }

    return this.scheduleService.findByUser(userId);
  }

  // Obtener un horario por ID (el propio dueño del horario o administradores)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const schedule = await this.scheduleService.findOne(id);
    const isSelf = req.user.sub === schedule.user_id;
    const isAdmin = req.user.role === UserRole.SUPERADMIN || req.user.role === UserRole.ADMIN;

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para ver este horario.');
    }

    return schedule;
  }

  // Modificar un horario (solo ADMIN o SUPERADMIN)
  @Patch(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
    return this.scheduleService.update(id, updateScheduleDto);
  }

  // Eliminar un horario (solo ADMIN o SUPERADMIN)
  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.scheduleService.remove(id);
  }
}
