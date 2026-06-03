import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Eventos (Events)')
@ApiBearerAuth('JWT-auth')
@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // Crear un nuevo evento (solo ADMIN o SUPERADMIN)
  @Post()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  // Listar todos los eventos (accesible para cualquier usuario autenticado)
  @Get()
  async findAll() {
    return this.eventsService.findAll();
  }

  // Obtener un evento por ID (accesible para cualquier usuario autenticado)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  // Actualizar un evento (solo ADMIN o SUPERADMIN)
  @Patch(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  // Eliminar un evento (solo ADMIN o SUPERADMIN)
  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
