import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export enum UserRole {
  SUPERADMIN = 'SUPERADMIN', // Único que puede delegar controles
  ADMIN = 'ADMIN',           // Control delegado (Jefe de área temporal)
  EMPLOYEE = 'EMPLOYEE',     // Empleado regular
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- Datos de cuenta ---
  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  // --- Datos Personales ---
  @Column()
  full_name: string;

  @Column({ unique: true, nullable: true, length: 20 })
  document_number: string; // DNI, Pasaporte, etc.

  @Column({ nullable: true, length: 20 })
  phone_number: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date; // Cumpleaños

  @Column({ nullable: true })
  photo_url: string;

  // --- Datos Laborales / de la Institución ---
  @Column({ nullable: true })
  position: string; // Cargo (ej. Investigador, Analista)

  @Column({ nullable: true })
  department: string; // Área, Oficina o Proyecto asignado

  @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
  role: UserRole;

  // --- Verificación y Seguridad ---
  @Column({ default: false })
  is_verified: boolean;

  @Column({ nullable: true })
  verification_token: string;

  @Column({ type: 'timestamp', nullable: true })
  verification_token_expires: Date;

  @Column({ nullable: true })
  reset_password_token: string;

  @Column({ type: 'timestamp', nullable: true })
  reset_password_expires: Date;

  // --- Estado ---
  @Column({ default: true })
  is_active: boolean;

  // --- Auditoría ---
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date; // Permite borrado lógico (Soft Delete)
}
