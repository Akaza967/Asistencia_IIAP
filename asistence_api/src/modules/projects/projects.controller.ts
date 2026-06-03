import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ProjectStatus } from './entities/project.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Proyectos (Projects)')
@ApiBearerAuth('JWT-auth')
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // Crear un nuevo proyecto (solo ADMIN o SUPERADMIN)
  @Post()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  // Listar todos los proyectos (accesible por cualquier usuario autenticado)
  @Get()
  async findAll(@Query('status') status?: ProjectStatus) {
    return this.projectsService.findAll(status);
  }

  // Obtener un proyecto por ID (accesible por cualquier usuario autenticado)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  // Actualizar un proyecto (solo ADMIN o SUPERADMIN)
  @Patch(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  // Eliminar un proyecto (solo ADMIN o SUPERADMIN)
  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
