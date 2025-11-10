import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('search_logs')
export class SearchLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  query!: string;

  @Column({ nullable: true })
  language?: string;

  @Column({ type: 'jsonb', nullable: true })
  filters?: Record<string, any>;

  @Column({ default: 0 })
  resultsCount!: number;

  @Column('uuid', { nullable: true })
  userId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @CreateDateColumn()
  createdAt!: Date;
}
