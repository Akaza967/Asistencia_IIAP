import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class AssignRoleDto {
  @IsEnum(UserRole, { message: 'El rol especificado no es válido.' })
  @IsNotEmpty({ message: 'El rol es obligatorio.' })
  role: UserRole;
}
