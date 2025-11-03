export const ES_INDEX_CONFIG = {
  settings: {
    analysis: {
      analyzer: {
        thai_analyzer: {
          type: 'custom',
          tokenizer: 'icu_tokenizer',
          filter: ['lowercase', 'icu_folding'],
        },
      },
    },
  },
  mappings: {
    properties: {
      title_en: {
        type: 'text',
        analyzer: 'english',
      },
      title_th: {
        type: 'text',
        analyzer: 'thai_analyzer',
      },
      content_en: {
        type: 'text',
        analyzer: 'english',
      },
      content_th: {
        type: 'text',
        analyzer: 'thai_analyzer',
      },
      summary_en: {
        type: 'text',
        analyzer: 'english',
      },
      summary_th: {
        type: 'text',
        analyzer: 'thai_analyzer',
      },
      document_type: {
        type: 'keyword',
      },
      document_id: {
        type: 'keyword',
      },
      publication_date: {
        type: 'date',
      },
      source_url: {
        type: 'keyword',
      },
      tags: {
        type: 'keyword',
      },
      jurisdiction: {
        type: 'keyword',
      },
      created_at: {
        type: 'date',
      },
      updated_at: {
        type: 'date',
      },
    },
  },
};
