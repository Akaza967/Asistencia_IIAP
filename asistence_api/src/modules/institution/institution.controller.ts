import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { InstitutionService } from './institution.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Sedes (Institutions)')
@ApiBearerAuth('JWT-auth')
@Controller('institutions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  // Crear una nueva sede (solo ADMIN o SUPERADMIN)
  @Post()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async create(@Body() createInstitutionDto: CreateInstitutionDto) {
    return this.institutionService.create(createInstitutionDto);
  }

  // Listar todas las sedes (accesible para cualquier usuario autenticado)
  @Get()
  async findAll() {
    return this.institutionService.findAll();
  }

  // Obtener una sede por su ID (accesible para cualquier usuario autenticado)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.institutionService.findOne(id);
  }

  // Actualizar una sede (solo ADMIN o SUPERADMIN)
  @Patch(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateInstitutionDto: UpdateInstitutionDto) {
    return this.institutionService.update(id, updateInstitutionDto);
  }

  // Eliminar una sede (solo ADMIN o SUPERADMIN)
  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.institutionService.remove(id);
  }
}
