import { Controller, Post, Body, UseGuards, Request, Get, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('attendance')
@UseGuards(JwtAuthGuard) // Asegura que solo usuarios autenticados puedan acceder
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark')
  async create(@Request() req, @Body() createAttendanceDto: CreateAttendanceDto) {
    // req.user.sub contiene el id del usuario inyectado por el JwtAuthGuard
    return this.attendanceService.create(req.user.sub, createAttendanceDto);
  }

  // Historial personal del usuario logueado (App Móvil)
  @Get('my-history')
  async getMyHistory(@Request() req) {
    return this.attendanceService.getUserHistory(req.user.sub);
  }

  // Reporte general de asistencias (Panel Administrador)
  @Get('history')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async getAllHistory(@Query('limit') limit?: number) {
    return this.attendanceService.getAllHistory(limit);
  }
}
