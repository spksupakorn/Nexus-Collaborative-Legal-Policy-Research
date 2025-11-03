import { injectable } from 'inversify';
import { Client } from '@elastic/elasticsearch';
import { IElasticsearchService } from '../interfaces/IElasticsearchService';
import { Document } from '../entities/Document';
import { ES_INDEX_CONFIG } from '../config/elasticsearch.config';

@injectable()
export class ElasticsearchService implements IElasticsearchService {
  private client: Client;
  private indexName: string;

  constructor() {
    this.client = new Client({
      node: process.env.ES_NODE || 'http://localhost:9200',
    });
    this.indexName = process.env.ES_INDEX_NAME || 'legal_docs';
  }

  async ensureIndex(): Promise<void> {
    const indexExists = await this.client.indices.exists({
      index: this.indexName,
    });

    if (!indexExists) {
      await this.client.indices.create({
        index: this.indexName,
        body: ES_INDEX_CONFIG,
      });
      console.log(`✅ Elasticsearch index '${this.indexName}' created`);
    }
  }

  async indexDocument(document: Document): Promise<void> {
    await this.client.index({
      index: this.indexName,
      id: document.id,
      document: {
        document_id: document.id,
        title_en: document.titleEn,
        title_th: document.titleTh,
        content_en: document.contentEn,
        content_th: document.contentTh,
        summary_en: document.summaryEn,
        summary_th: document.summaryTh,
        document_type: document.documentType,
        publication_date: document.publicationDate,
        source_url: document.sourceUrl,
        tags: document.tags || [],
        jurisdiction: document.jurisdiction,
        created_at: document.createdAt,
        updated_at: document.updatedAt,
      },
    });

    await this.client.indices.refresh({ index: this.indexName });
  }

  async updateDocument(documentId: string, document: Partial<Document>): Promise<void> {
    const updateBody: any = {};
    
    if (document.titleEn) updateBody.title_en = document.titleEn;
    if (document.titleTh) updateBody.title_th = document.titleTh;
    if (document.contentEn) updateBody.content_en = document.contentEn;
    if (document.contentTh) updateBody.content_th = document.contentTh;
    if (document.summaryEn) updateBody.summary_en = document.summaryEn;
    if (document.summaryTh) updateBody.summary_th = document.summaryTh;
    if (document.documentType) updateBody.document_type = document.documentType;
    if (document.publicationDate) updateBody.publication_date = document.publicationDate;
    if (document.sourceUrl) updateBody.source_url = document.sourceUrl;
    if (document.tags) updateBody.tags = document.tags;
    if (document.jurisdiction) updateBody.jurisdiction = document.jurisdiction;

    await this.client.update({
      index: this.indexName,
      id: documentId,
      doc: updateBody,
    });

    await this.client.indices.refresh({ index: this.indexName });
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.client.delete({
      index: this.indexName,
      id: documentId,
    });

    await this.client.indices.refresh({ index: this.indexName });
  }

  async bulkIndex(documents: Document[]): Promise<void> {
    const operations = documents.flatMap((doc) => [
      { index: { _index: this.indexName, _id: doc.id } },
      {
        document_id: doc.id,
        title_en: doc.titleEn,
        title_th: doc.titleTh,
        content_en: doc.contentEn,
        content_th: doc.contentTh,
        summary_en: doc.summaryEn,
        summary_th: doc.summaryTh,
        document_type: doc.documentType,
        publication_date: doc.publicationDate,
        source_url: doc.sourceUrl,
        tags: doc.tags || [],
        jurisdiction: doc.jurisdiction,
        created_at: doc.createdAt,
        updated_at: doc.updatedAt,
      },
    ]);

    await this.client.bulk({ operations });
    await this.client.indices.refresh({ index: this.indexName });
  }

  getClient(): Client {
    return this.client;
  }

  getIndexName(): string {
    return this.indexName;
  }
}
