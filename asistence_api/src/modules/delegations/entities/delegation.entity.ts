import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('scan_delegations')
export class ScanDelegation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  delegator_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'delegator_id' })
  delegator: User;

  @Column()
  delegatee_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'delegatee_id' })
  delegatee: User;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
