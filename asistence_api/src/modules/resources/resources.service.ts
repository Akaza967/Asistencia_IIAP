import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource, ResourceStatus } from './entities/resource.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
  ) {}

  // Registrar un nuevo recurso
  async create(createResourceDto: CreateResourceDto) {
    const { code } = createResourceDto;

    const existing = await this.resourceRepository.findOne({ where: { code } });
    if (existing) {
      throw new BadRequestException(`Ya existe un recurso registrado con el código de activo: ${code}.`);
    }

    const resource = this.resourceRepository.create(createResourceDto);
    await this.resourceRepository.save(resource);

    return {
      message: 'Recurso/activo registrado correctamente.',
      data: resource,
    };
  }

  // Listar todos los recursos/activos
  async findAll(status?: ResourceStatus) {
    const whereCondition = status ? { status } : {};
    return this.resourceRepository.find({
      where: whereCondition,
      order: { created_at: 'DESC' },
    });
  }

  // Buscar un recurso por ID
  async findOne(id: string) {
    const resource = await this.resourceRepository.findOne({ where: { id } });
    if (!resource) {
      throw new NotFoundException('El recurso/activo especificado no existe.');
    }
    return resource;
  }

  // Actualizar un recurso
  async update(id: string, updateResourceDto: UpdateResourceDto) {
    const resource = await this.findOne(id);
    const { code } = updateResourceDto;

    // Validar código único en caso de cambio
    if (code && code !== resource.code) {
      const existing = await this.resourceRepository.findOne({ where: { code } });
      if (existing) {
        throw new BadRequestException(`Ya existe otro recurso registrado con el código de activo: ${code}.`);
      }
    }

    Object.assign(resource, updateResourceDto);
    await this.resourceRepository.save(resource);

    return {
      message: 'Recurso/activo actualizado correctamente.',
      data: resource,
    };
  }

  // Eliminar un recurso físicamente
  async remove(id: string) {
    const resource = await this.findOne(id);
    await this.resourceRepository.remove(resource);
    return {
      message: 'Recurso/activo eliminado con éxito.',
    };
  }
}
