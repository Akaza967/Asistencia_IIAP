import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AssignRoleDto } from './dto/assign-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async assignRole(id: string, assignRoleDto: AssignRoleDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

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
}
