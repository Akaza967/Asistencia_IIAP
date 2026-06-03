import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Listar todos los usuarios
  async findAll() {
    return this.userRepository.find({
      select: {
        id: true,
        email: true,
        full_name: true,
        document_number: true,
        phone_number: true,
        date_of_birth: true,
        photo_url: true,
        position: true,
        department: true,
        role: true,
        is_verified: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
      order: { created_at: 'DESC' },
    });
  }

  // Obtener un usuario por ID
  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        full_name: true,
        document_number: true,
        phone_number: true,
        date_of_birth: true,
        photo_url: true,
        position: true,
        department: true,
        role: true,
        is_verified: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  // Asignar rol (delegación de control)
  async assignRole(id: string, assignRoleDto: AssignRoleDto) {
    const user = await this.findOne(id);

    user.role = assignRoleDto.role;
    await this.userRepository.save(user);

    return { 
      message: `Control delegado correctamente. El usuario ${user.full_name} ahora tiene el rol de ${user.role}.`,
      user: {
        id: user.id,
        full_name: user.full_name,
        role: user.role
      }
    };
  }

  // Actualizar datos del perfil
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    // Si intenta cambiar el document_number, validamos que no esté duplicado por otro usuario
    if (updateUserDto.document_number && updateUserDto.document_number !== user.document_number) {
      const existingDoc = await this.userRepository.findOne({
        where: { document_number: updateUserDto.document_number },
      });
      if (existingDoc) {
        throw new BadRequestException('El número de documento ya está registrado por otro usuario.');
      }
    }

    // Fusionamos los datos del DTO en la entidad usuario
    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    // Retornamos los datos limpios sin el password_hash
    return this.findOne(id);
  }

  // Eliminación lógica del usuario (Soft Delete)
  async softDelete(id: string) {
    const user = await this.findOne(id);

    if (!user.is_active) {
      throw new BadRequestException('El usuario ya se encuentra desactivado.');
    }

    // Marcamos como inactivo y aplicamos soft delete de TypeORM
    user.is_active = false;
    await this.userRepository.save(user);
    await this.userRepository.softDelete(id);

    return {
      message: `Usuario ${user.full_name} desactivado y eliminado lógicamente con éxito.`,
    };
  }
}
