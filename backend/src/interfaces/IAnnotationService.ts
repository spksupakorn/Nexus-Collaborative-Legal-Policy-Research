import { Annotation } from '../entities/Annotation';

export interface CreateAnnotationDTO {
  userId: string;
  documentId: string;
  content: string;
  isPrivate?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateAnnotationDTO {
  content?: string;
  isPrivate?: boolean;
  metadata?: Record<string, any>;
}

export interface IAnnotationService {
  create(annotationData: CreateAnnotationDTO): Promise<Annotation>;
  update(id: string, userId: string, annotationData: UpdateAnnotationDTO): Promise<Annotation>;
  delete(id: string, userId: string): Promise<void>;
  findByDocument(documentId: string, userId?: string): Promise<Annotation[]>;
  findByUser(userId: string): Promise<Annotation[]>;
}
