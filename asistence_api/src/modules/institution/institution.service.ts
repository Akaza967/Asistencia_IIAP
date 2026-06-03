import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institution } from './entities/institution.entity';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Injectable()
export class InstitutionService {
  constructor(
    @InjectRepository(Institution)
    private readonly institutionRepository: Repository<Institution>,
  ) {}

  // Crear una nueva sede
  async create(createInstitutionDto: CreateInstitutionDto) {
    const { code } = createInstitutionDto;

    const existing = await this.institutionRepository.findOne({ where: { code } });
    if (existing) {
      throw new BadRequestException(`Ya existe una sede registrada con el código: ${code}.`);
    }

    const institution = this.institutionRepository.create(createInstitutionDto);
    await this.institutionRepository.save(institution);

    return {
      message: 'Sede institucional creada correctamente.',
      data: institution,
    };
  }

  // Listar todas las sedes
  async findAll() {
    return this.institutionRepository.find({
      order: { name: 'ASC' },
    });
  }

  // Buscar una sede por ID
  async findOne(id: string) {
    const institution = await this.institutionRepository.findOne({ where: { id } });
    if (!institution) {
      throw new NotFoundException('La sede institucional especificada no existe.');
    }
    return institution;
  }

  // Actualizar una sede
  async update(id: string, updateInstitutionDto: UpdateInstitutionDto) {
    const institution = await this.findOne(id);
    const { code } = updateInstitutionDto;

    // Validar duplicidad de código si cambia
    if (code && code !== institution.code) {
      const existing = await this.institutionRepository.findOne({ where: { code } });
      if (existing) {
        throw new BadRequestException(`Ya existe otra sede registrada con el código: ${code}.`);
      }
    }

    Object.assign(institution, updateInstitutionDto);
    await this.institutionRepository.save(institution);

    return {
      message: 'Sede institucional actualizada correctamente.',
      data: institution,
    };
  }

  // Eliminar una sede físicamente
  async remove(id: string) {
    const institution = await this.findOne(id);
    await this.institutionRepository.remove(institution);
    return {
      message: 'Sede institucional eliminada con éxito.',
    };
  }
}
