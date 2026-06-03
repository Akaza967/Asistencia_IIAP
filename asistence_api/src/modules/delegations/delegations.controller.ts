import { Controller, Post, Get, Patch, Param, Body, Request, UseGuards } from '@nestjs/common';
import { DelegationsService } from './delegations.service';
import { CreateDelegationDto } from './dto/create-delegation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Delegaciones de Escaneo (Delegations)')
@ApiBearerAuth('JWT-auth')
@Controller('delegations')
@UseGuards(JwtAuthGuard)
export class DelegationsController {
  constructor(private readonly delegationsService: DelegationsService) {}

  // Crear delegación (sólo ADMIN y SUPERADMIN)
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async create(@Request() req, @Body() createDelegationDto: CreateDelegationDto) {
    return this.delegationsService.create(req.user.sub, createDelegationDto);
  }

  // Obtener mis delegaciones (enviadas si es ADMIN/SUPERADMIN, recibidas si es EMPLOYEE)
  @Get()
  async getMyDelegations(@Request() req) {
    return this.delegationsService.findMyDelegations(req.user.sub);
  }

  // Revocar/Desactivar una delegación
  @Patch(':id/deactivate')
  async deactivate(@Request() req, @Param('id') id: string) {
    return this.delegationsService.deactivate(req.user.sub, id);
  }
}
