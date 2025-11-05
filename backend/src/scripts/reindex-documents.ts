import { AppDataSource } from '../config/database';
import { Document } from '../entities/Document';
import { Client } from '@elastic/elasticsearch';

async function reindexDocuments() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    
    console.log('Connecting to Elasticsearch...');
    const esClient = new Client({ node: 'http://search:9200' });
    
    console.log('Fetching documents from PostgreSQL...');
    const documentRepo = AppDataSource.getRepository(Document);
    const documents = await documentRepo.find();
    
    console.log(`Found ${documents.length} documents in PostgreSQL`);
    
    if (documents.length === 0) {
      console.log('No documents to index.');
      process.exit(0);
    }
    
    for (const doc of documents) {
      const esDoc = {
        id: doc.id,
        title_en: doc.titleEn,
        title_th: doc.titleTh,
        content_en: doc.contentEn,
        content_th: doc.contentTh,
        summary_en: doc.summaryEn,
        summary_th: doc.summaryTh,
        document_type: doc.documentType,
        jurisdiction: doc.jurisdiction,
        tags: doc.tags || [],
        publication_date: doc.publicationDate,
        created_at: doc.createdAt
      };
      
      await esClient.index({
        index: 'legal_docs',
        id: doc.id,
        document: esDoc
      });
      
      console.log(`✅ Indexed: ${doc.titleEn || doc.titleTh}`);
    }
    
    await esClient.indices.refresh({ index: 'legal_docs' });
    console.log(`\n✅ Successfully indexed ${documents.length} documents!`);
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

reindexDocuments();
