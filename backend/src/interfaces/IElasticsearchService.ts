import { Document } from '../entities/Document';

export interface IElasticsearchService {
  indexDocument(document: Document): Promise<void>;
  updateDocument(documentId: string, document: Partial<Document>): Promise<void>;
  deleteDocument(documentId: string): Promise<void>;
  ensureIndex(): Promise<void>;
  bulkIndex(documents: Document[]): Promise<void>;
}
