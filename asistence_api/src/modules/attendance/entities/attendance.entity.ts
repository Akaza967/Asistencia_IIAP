import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AttendanceType {
  CHECK_IN = 'CHECK_IN',       // Ingreso
  CHECK_OUT = 'CHECK_OUT',     // Salida
  BREAK_START = 'BREAK_START', // Inicio de refrigerio / pausa
  BREAK_END = 'BREAK_END',     // Fin de refrigerio / pausa
}

export enum AttendanceStatus {
  ON_TIME = 'ON_TIME',                 // A tiempo
  LATE = 'LATE',                       // Tardanza
  EARLY_DEPARTURE = 'EARLY_DEPARTURE', // Salida antes de tiempo
  EXCUSED = 'EXCUSED',                 // Falta o tardanza justificada
  PENDING_REVIEW = 'PENDING_REVIEW'    // Pendiente de revisión manual
}

export enum AttendanceVerificationMethod {
  MANUAL = 'MANUAL',
  FACIAL_SCAN = 'FACIAL_SCAN'
}

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- Relación con Usuario ---
  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // --- Datos principales de asistencia ---
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date; // Fecha y hora exacta de la marca

  @Column({ type: 'enum', enum: AttendanceType })
  type: AttendanceType;

  @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.ON_TIME })
  status: AttendanceStatus;

  // --- Evidencia y Geolocalización (Mobile App) ---
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  photo_url: string; // Si la app requiere una selfie al marcar

  @Column({ nullable: true })
  device_id: string; // Para evitar que marquen desde otros teléfonos no registrados

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // Información adicional (ej. dirección aproximada, IP, etc.)

  @Column({ type: 'enum', enum: AttendanceVerificationMethod, default: AttendanceVerificationMethod.MANUAL })
  verification_method: AttendanceVerificationMethod;

  @Column({ nullable: true })
  marked_by_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'marked_by_id' })
  marked_by: User;

  // --- Observaciones y justificaciones ---
  @Column({ type: 'text', nullable: true })
  observations: string; // Notas adicionales (ej. "Llegué tarde por tráfico")

  // --- Relaciones a otros módulos (opcional/preparación) ---
  @Column({ nullable: true })
  project_id: string; // Si asiste para un proyecto específico de IIAP

  @Column({ nullable: true })
  schedule_id: string; // Si se vincula a un horario específico para validar el status

  // --- Auditoría ---
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
