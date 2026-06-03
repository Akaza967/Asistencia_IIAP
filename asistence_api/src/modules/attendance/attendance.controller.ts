import { Controller, Post, Body, UseGuards, Request, Get, Query, ForbiddenException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { DelegationsService } from '../delegations/delegations.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Asistencias (Attendance)')
@ApiBearerAuth('JWT-auth')
@Controller('attendance')
@UseGuards(JwtAuthGuard) // Asegura que solo usuarios autenticados puedan acceder
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly delegationsService: DelegationsService,
  ) {}

  @Post('mark')
  async create(@Request() req, @Body() createAttendanceDto: CreateAttendanceDto) {
    const operatorId = req.user.sub;
    const targetUserId = createAttendanceDto.user_id || operatorId;

    if (targetUserId !== operatorId) {
      // Verificar si el operador tiene rol de ADMIN/SUPERADMIN o una delegación activa
      const isOperatorAdmin = req.user.role === UserRole.SUPERADMIN || req.user.role === UserRole.ADMIN;
      if (!isOperatorAdmin) {
        const hasDelegation = await this.delegationsService.hasActiveDelegation(operatorId);
        if (!hasDelegation) {
          throw new ForbiddenException('No tienes autorización para registrar la asistencia de otros usuarios.');
        }
      }
    }

    return this.attendanceService.create(targetUserId, operatorId, createAttendanceDto);
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
