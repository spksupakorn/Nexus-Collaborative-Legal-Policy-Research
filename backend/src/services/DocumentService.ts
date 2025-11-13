import { injectable, inject } from 'inversify';
import { AppDataSource } from '../config/database';
import { Document } from '../entities/Document';
import { IDocumentService, CreateDocumentDTO, UpdateDocumentDTO } from '../interfaces/IDocumentService';
import { IElasticsearchService } from '../interfaces/IElasticsearchService';
import { TYPES } from '../config/types';

@injectable()
export class DocumentService implements IDocumentService {
  private readonly documentRepository = AppDataSource.getRepository(Document);

  constructor(
    @inject(TYPES.IElasticsearchService) private esService: IElasticsearchService
  ) {}

  async findById(id: string): Promise<Document | null> {
    return this.documentRepository.findOne({
      where: { id },
      relations: ['outgoingLinks', 'incomingLinks', 'annotations'],
    });
  }

  async create(documentData: CreateDocumentDTO): Promise<Document> {
    const document = this.documentRepository.create(documentData);
    const savedDocument = await this.documentRepository.save(document);

    // Index in Elasticsearch
    await this.esService.indexDocument(savedDocument);

    return savedDocument;
  }

  async update(id: string, documentData: UpdateDocumentDTO): Promise<Document> {
    await this.documentRepository.update(id, documentData);
    const updatedDocument = await this.findById(id);

    if (!updatedDocument) {
      throw new Error('Document not found');
    }

    // Update in Elasticsearch
    await this.esService.updateDocument(id, documentData);

    return updatedDocument;
  }

  async delete(id: string): Promise<void> {
    await this.documentRepository.delete(id);
    
    // Delete from Elasticsearch
    await this.esService.deleteDocument(id);
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ documents: Document[]; total: number }> {
    const [documents, total] = await this.documentRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { documents, total };
  }
}
