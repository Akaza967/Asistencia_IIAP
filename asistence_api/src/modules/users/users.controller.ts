import { Controller, Get, Patch, Delete, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Usuarios (Users)')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Obtener perfil del usuario autenticado actual
  @Get('me')
  async getMyProfile(@Request() req) {
    return this.usersService.findOne(req.user.sub);
  }

  // Listar todos los usuarios (solo ADMIN o SUPERADMIN)
  @Get()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async findAll() {
    return this.usersService.findAll();
  }

  // Obtener un usuario por ID (el propio usuario o administradores)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const isSelf = req.user.sub === id;
    const isAdmin = req.user.role === UserRole.SUPERADMIN || req.user.role === UserRole.ADMIN;

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para ver este perfil.');
    }

    return this.usersService.findOne(id);
  }

  // Únicamente el SUPERADMIN puede promover/degradar roles (delegar control)
  @Patch(':id/role')
  @Roles(UserRole.SUPERADMIN)
  async assignRole(@Param('id') id: string, @Body() assignRoleDto: AssignRoleDto) {
    return this.usersService.assignRole(id, assignRoleDto);
  }

  // Actualizar datos del perfil (el propio usuario o administradores)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    const isSelf = req.user.sub === id;
    const isAdmin = req.user.role === UserRole.SUPERADMIN || req.user.role === UserRole.ADMIN;

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para editar este perfil.');
    }

    return this.usersService.update(id, updateUserDto);
  }

  // Eliminación lógica de un usuario (solo SUPERADMIN)
  @Delete(':id')
  @Roles(UserRole.SUPERADMIN)
  async remove(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }
}
