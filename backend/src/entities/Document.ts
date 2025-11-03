import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { DocumentLink } from './DocumentLink';
import { Annotation } from './Annotation';

export enum DocumentType {
  LAW = 'LAW',
  REGULATION = 'REGULATION',
  CASE_LAW = 'CASE_LAW',
  POLICY = 'POLICY',
  ACADEMIC = 'ACADEMIC',
  TREATY = 'TREATY',
  OTHER = 'OTHER',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index()
  titleEn!: string;

  @Column()
  @Index()
  titleTh!: string;

  @Column({ type: 'text', nullable: true })
  summaryEn?: string;

  @Column({ type: 'text', nullable: true })
  summaryTh?: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  @Index()
  documentType!: DocumentType;

  @Column({ nullable: true })
  sourceUrl?: string;

  @Column({ type: 'date', nullable: true })
  @Index()
  publicationDate?: Date;

  @Column({ nullable: true })
  jurisdiction?: string;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column({ type: 'text', nullable: true })
  contentEn?: string;

  @Column({ type: 'text', nullable: true })
  contentTh?: string;

  @OneToMany(() => DocumentLink, (link) => link.sourceDocument)
  outgoingLinks!: DocumentLink[];

  @OneToMany(() => DocumentLink, (link) => link.targetDocument)
  incomingLinks!: DocumentLink[];

  @OneToMany(() => Annotation, (annotation) => annotation.document)
  annotations!: Annotation[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
