import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Document } from './Document';

export enum LinkType {
  CITES = 'CITES',
  CITED_BY = 'CITED_BY',
  AMENDS = 'AMENDS',
  AMENDED_BY = 'AMENDED_BY',
  SUPERSEDES = 'SUPERSEDES',
  SUPERSEDED_BY = 'SUPERSEDED_BY',
  REFERENCES = 'REFERENCES',
  RELATED = 'RELATED',
  CONFLICTS_WITH = 'CONFLICTS_WITH',
}

@Entity('document_links')
@Index(['sourceDocument', 'targetDocument'], { unique: true })
export class DocumentLink {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Document, (document) => document.outgoingLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'source_document_id' })
  sourceDocument!: Document;

  @ManyToOne(() => Document, (document) => document.incomingLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'target_document_id' })
  targetDocument!: Document;

  @Column({
    type: 'enum',
    enum: LinkType,
  })
  linkType!: LinkType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
