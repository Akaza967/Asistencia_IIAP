import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ResourceStatus } from './entities/resource.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Recursos (Resources)')
@ApiBearerAuth('JWT-auth')
@Controller('resources')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  // Registrar un nuevo activo/recurso (solo ADMIN o SUPERADMIN)
  @Post()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async create(@Body() createResourceDto: CreateResourceDto) {
    return this.resourcesService.create(createResourceDto);
  }

  // Listar todos los recursos (accesible para cualquier usuario autenticado)
  @Get()
  async findAll(@Query('status') status?: ResourceStatus) {
    return this.resourcesService.findAll(status);
  }

  // Obtener un recurso por ID (accesible para cualquier usuario autenticado)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id);
  }

  // Actualizar un recurso (solo ADMIN o SUPERADMIN)
  @Patch(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateResourceDto: UpdateResourceDto) {
    return this.resourcesService.update(id, updateResourceDto);
  }

  // Eliminar un recurso (solo ADMIN o SUPERADMIN)
  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.resourcesService.remove(id);
  }
}
