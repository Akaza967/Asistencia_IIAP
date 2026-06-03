import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  // Crear un nuevo proyecto
  async create(createProjectDto: CreateProjectDto) {
    const { name } = createProjectDto;

    // Validar que el nombre no esté duplicado
    const existing = await this.projectRepository.findOne({ where: { name } });
    if (existing) {
      throw new BadRequestException('Ya existe un proyecto registrado con ese nombre.');
    }

    const project = this.projectRepository.create(createProjectDto);
    await this.projectRepository.save(project);

    return {
      message: 'Proyecto creado correctamente.',
      data: project,
    };
  }

  // Listar todos los proyectos (con filtro opcional de estado)
  async findAll(status?: ProjectStatus) {
    const whereCondition = status ? { status } : {};
    return this.projectRepository.find({
      where: whereCondition,
      order: { created_at: 'DESC' },
    });
  }

  // Buscar un proyecto por ID
  async findOne(id: string) {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException('El proyecto especificado no existe.');
    }
    return project;
  }

  // Actualizar un proyecto
  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.findOne(id);
    const { name } = updateProjectDto;

    // Validar duplicados si se cambia el nombre
    if (name && name !== project.name) {
      const existing = await this.projectRepository.findOne({ where: { name } });
      if (existing) {
        throw new BadRequestException('Ya existe otro proyecto registrado con ese nombre.');
      }
    }

    Object.assign(project, updateProjectDto);
    await this.projectRepository.save(project);

    return {
      message: 'Proyecto actualizado correctamente.',
      data: project,
    };
  }

  // Eliminar un proyecto
  async remove(id: string) {
    const project = await this.findOne(id);
    
    try {
      await this.projectRepository.remove(project);
      return {
        message: 'Proyecto eliminado con éxito.',
      };
    } catch (error) {
      // Manejar error si ya está vinculado a marcas de asistencia (FK constraint)
      throw new BadRequestException(
        'No se puede eliminar el proyecto porque tiene registros de asistencia asociados. Intente cambiar su estado a ON_HOLD o COMPLETED.'
      );
    }
  }
}
