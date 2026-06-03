import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ScanDelegation } from './entities/delegation.entity';
import { CreateDelegationDto } from './dto/create-delegation.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class DelegationsService {
  constructor(
    @InjectRepository(ScanDelegation)
    private readonly delegationRepository: Repository<ScanDelegation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(delegatorId: string, createDto: CreateDelegationDto) {
    const { delegatee_id, start_date, end_date } = createDto;

    // 1. Validar que el delegador exista y sea ADMIN o SUPERADMIN
    const delegator = await this.userRepository.findOne({ where: { id: delegatorId } });
    if (!delegator) {
      throw new NotFoundException('Usuario delegador no encontrado.');
    }
    if (delegator.role !== UserRole.ADMIN && delegator.role !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('Solo los administradores o ingenieros a cargo pueden delegar controles.');
    }

    // 2. Validar que el delegado exista
    const delegatee = await this.userRepository.findOne({ where: { id: delegatee_id } });
    if (!delegatee) {
      throw new NotFoundException('Usuario delegado no encontrado.');
    }

    // Evitar auto-delegación
    if (delegatorId === delegatee_id) {
      throw new BadRequestException('No puedes delegarte el permiso a ti mismo.');
    }

    // 3. Validar fechas
    const start = new Date(start_date);
    const end = new Date(end_date);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Las fechas proporcionadas no son válidas.');
    }

    if (start >= end) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin.');
    }

    if (end <= now) {
      throw new BadRequestException('La fecha de fin debe estar en el futuro.');
    }

    // 4. Crear y guardar la delegación
    const delegation = this.delegationRepository.create({
      delegator_id: delegatorId,
      delegatee_id,
      start_date: start,
      end_date: end,
      is_active: true,
    });

    await this.delegationRepository.save(delegation);

    return {
      message: 'Delegación de escaneo creada correctamente.',
      data: {
        id: delegation.id,
        delegator: { id: delegator.id, full_name: delegator.full_name },
        delegatee: { id: delegatee.id, full_name: delegatee.full_name },
        start_date: delegation.start_date,
        end_date: delegation.end_date,
        is_active: delegation.is_active,
      },
    };
  }

  // Verifica si un usuario tiene una delegación activa en este momento
  async hasActiveDelegation(delegateeId: string): Promise<boolean> {
    const now = new Date();
    const count = await this.delegationRepository.count({
      where: {
        delegatee_id: delegateeId,
        is_active: true,
        start_date: LessThanOrEqual(now),
        end_date: MoreThanOrEqual(now),
      },
    });
    return count > 0;
  }

  // Listar delegaciones para un usuario (enviadas o recibidas según el rol)
  async findMyDelegations(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN) {
      // Como administrador, ver delegaciones que he creado
      return this.delegationRepository.find({
        where: { delegator_id: userId },
        relations: ['delegatee'],
        order: { created_at: 'DESC' },
      });
    } else {
      // Como empleado, ver delegaciones que he recibido
      return this.delegationRepository.find({
        where: { delegatee_id: userId },
        relations: ['delegator'],
        order: { created_at: 'DESC' },
      });
    }
  }

  // Desactivar/revocar una delegación antes de tiempo
  async deactivate(userId: string, delegationId: string) {
    const delegation = await this.delegationRepository.findOne({ where: { id: delegationId } });
    if (!delegation) {
      throw new NotFoundException('Delegación no encontrada.');
    }

    // Verificar si el que desactiva es el creador o un SUPERADMIN
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (delegation.delegator_id !== userId && user.role !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('No tienes permisos para revocar esta delegación.');
    }

    if (!delegation.is_active) {
      throw new BadRequestException('Esta delegación ya se encuentra inactiva.');
    }

    delegation.is_active = false;
    await this.delegationRepository.save(delegation);

    return {
      message: 'Delegación revocada/desactivada con éxito.',
      data: {
        id: delegation.id,
        is_active: delegation.is_active,
      },
    };
  }
}
