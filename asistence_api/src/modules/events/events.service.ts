import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  // Crear un nuevo evento
  async create(createEventDto: CreateEventDto) {
    const { start_date, end_date } = createEventDto;

    // Validar coherencia de fechas
    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin.');
    }

    const event = this.eventRepository.create(createEventDto);
    await this.eventRepository.save(event);

    return {
      message: 'Evento corporativo registrado correctamente.',
      data: event,
    };
  }

  // Listar todos los eventos
  async findAll() {
    return this.eventRepository.find({
      order: { start_date: 'DESC' },
    });
  }

  // Buscar un evento por ID
  async findOne(id: string) {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('El evento especificado no existe.');
    }
    return event;
  }

  // Actualizar un evento
  async update(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.findOne(id);
    const { start_date, end_date } = updateEventDto;

    const finalStart = start_date ? new Date(start_date) : event.start_date;
    const finalEnd = end_date ? new Date(end_date) : event.end_date;

    if (finalStart >= finalEnd) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin.');
    }

    Object.assign(event, updateEventDto);
    await this.eventRepository.save(event);

    return {
      message: 'Evento corporativo actualizado correctamente.',
      data: event,
    };
  }

  // Eliminar un evento físicamente
  async remove(id: string) {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
    return {
      message: 'Evento corporativo eliminado con éxito.',
    };
  }
}
