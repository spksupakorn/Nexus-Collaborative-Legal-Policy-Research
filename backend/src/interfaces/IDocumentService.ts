import { Document, DocumentType } from '../entities/Document';

export interface CreateDocumentDTO {
  titleEn: string;
  titleTh: string;
  summaryEn?: string;
  summaryTh?: string;
  contentEn?: string;
  contentTh?: string;
  documentType: DocumentType;
  sourceUrl?: string;
  publicationDate?: Date;
  jurisdiction?: string;
  tags?: string[];
}

export interface UpdateDocumentDTO extends Partial<CreateDocumentDTO> {}

export interface IDocumentService {
  findById(id: string): Promise<Document | null>;
  create(documentData: CreateDocumentDTO): Promise<Document>;
  update(id: string, documentData: UpdateDocumentDTO): Promise<Document>;
  delete(id: string): Promise<void>;
  findAll(page: number, limit: number): Promise<{ documents: Document[]; total: number }>;
}
