import 'reflect-metadata';
import { Client } from '@elastic/elasticsearch';

const ES_NODE = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
const ES_INDEX = 'legal_docs';

async function initializeElasticsearch() {
  const client = new Client({
    node: ES_NODE,
  });

  console.log('🔍 Initializing Elasticsearch...');
  console.log(`📍 Node: ${ES_NODE}`);
  console.log(`📇 Index: ${ES_INDEX}`);

  try {
    // Check if index exists
    const indexExists = await client.indices.exists({
      index: ES_INDEX,
    });

    if (indexExists) {
      console.log(`✅ Index '${ES_INDEX}' already exists`);
      return;
    }

    console.log(`📝 Creating index '${ES_INDEX}'...`);

    // Create index with Thai language support
    await client.indices.create({
      index: ES_INDEX,
      body: {
        settings: {
          analysis: {
            analyzer: {
              thai_analyzer: {
                type: 'custom',
                tokenizer: 'icu_tokenizer',
                filter: ['lowercase', 'decimal_digit'],
              },
              english_analyzer: {
                type: 'english',
              },
            },
          },
          number_of_shards: 1,
          number_of_replicas: 0,
        },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            titleEn: {
              type: 'text',
              analyzer: 'english_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            titleTh: {
              type: 'text',
              analyzer: 'thai_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            contentEn: {
              type: 'text',
              analyzer: 'english_analyzer',
            },
            contentTh: {
              type: 'text',
              analyzer: 'thai_analyzer',
            },
            summaryEn: {
              type: 'text',
              analyzer: 'english_analyzer',
            },
            summaryTh: {
              type: 'text',
              analyzer: 'thai_analyzer',
            },
            documentType: { type: 'keyword' },
            tags: { type: 'keyword' },
            jurisdiction: { type: 'keyword' },
            publicationDate: { type: 'date' },
            sourceUrl: { type: 'keyword' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
          },
        },
      },
    });

    console.log(`✅ Index '${ES_INDEX}' created successfully!`);
    console.log('✨ Elasticsearch is ready for indexing documents');

  } catch (error: any) {
    console.error('❌ Error initializing Elasticsearch:', error.message);
    throw error;
  } finally {
    await client.close();
  }
}

// Run initialization
initializeElasticsearch()
  .then(() => {
    console.log('🎉 Elasticsearch initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Initialization failed:', error);
    process.exit(1);
  });
