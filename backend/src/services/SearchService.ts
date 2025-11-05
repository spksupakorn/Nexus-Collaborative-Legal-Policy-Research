import { injectable, inject } from 'inversify';
import { Client } from '@elastic/elasticsearch';
import { TYPES } from '../config/types';
import { ISearchService, SearchQuery, SearchResponse, SearchResult, TrendQuery, TrendData } from '../interfaces/ISearchService';
import { IElasticsearchService } from '../interfaces/IElasticsearchService';
import { ElasticsearchService } from './ElasticsearchService';

@injectable()
export class SearchService implements ISearchService {
  private client: Client;
  private indexName: string;

  constructor(
    @inject(TYPES.IElasticsearchService) private esService: ElasticsearchService
  ) {
    this.client = this.esService.getClient();
    this.indexName = this.esService.getIndexName();
  }

  async search(query: SearchQuery): Promise<SearchResponse> {
    const {
      query: searchText,
      filters = {},
      page = 1,
      limit = 20,
      language = 'both',
    } = query;

    const from = (page - 1) * limit;

    // Build multi-match query based on language
    const fields = this.getSearchFields(language);
    
    const mustClauses: any[] = [
      {
        multi_match: {
          query: searchText,
          fields,
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      },
    ];

    // Add filters
    const filterClauses: any[] = [];
    
    if (filters.documentType && filters.documentType.length > 0) {
      filterClauses.push({
        terms: { document_type: filters.documentType },
      });
    }

    if (filters.jurisdiction && filters.jurisdiction.length > 0) {
      filterClauses.push({
        terms: { jurisdiction: filters.jurisdiction },
      });
    }

    if (filters.tags && filters.tags.length > 0) {
      filterClauses.push({
        terms: { tags: filters.tags },
      });
    }

    if (filters.dateFrom || filters.dateTo) {
      const rangeQuery: any = {};
      if (filters.dateFrom) rangeQuery.gte = filters.dateFrom;
      if (filters.dateTo) rangeQuery.lte = filters.dateTo;
      
      filterClauses.push({
        range: { publication_date: rangeQuery },
      });
    }

    // Execute search with aggregations
    const response = await this.client.search({
      index: this.indexName,
      from,
      size: limit,
      body: {
        query: {
          bool: {
            must: mustClauses,
            filter: filterClauses,
          },
        },
        highlight: {
          fields: {
            'content_en': {},
            'content_th': {},
            'title_en': {},
            'title_th': {},
          },
          pre_tags: ['<mark>'],
          post_tags: ['</mark>'],
        },
        aggregations: {
          document_types: {
            terms: { field: 'document_type.keyword', size: 20 },
          },
          jurisdictions: {
            terms: { field: 'jurisdiction.keyword', size: 50 },
          },
          tags: {
            terms: { field: 'tags.keyword', size: 100 },
          },
        },
      },
    });

    const results: SearchResult[] = response.hits.hits.map((hit: any) => ({
      id: hit._id,
      documentId: hit._source.document_id,
      titleEn: hit._source.title_en,
      titleTh: hit._source.title_th,
      summaryEn: hit._source.summary_en,
      summaryTh: hit._source.summary_th,
      documentType: hit._source.document_type,
      publicationDate: hit._source.publication_date,
      highlights: hit.highlight,
      score: hit._score,
    }));

    const facets = {
      documentTypes: (response.aggregations?.document_types as any)?.buckets?.map((b: any) => ({
        key: b.key,
        count: b.doc_count,
      })) || [],
      jurisdictions: (response.aggregations?.jurisdictions as any)?.buckets?.map((b: any) => ({
        key: b.key,
        count: b.doc_count,
      })) || [],
      tags: (response.aggregations?.tags as any)?.buckets?.map((b: any) => ({
        key: b.key,
        count: b.doc_count,
      })) || [],
    };

    return {
      results,
      total: typeof response.hits.total === 'number' ? response.hits.total : response.hits.total?.value || 0,
      page,
      limit,
      facets,
    };
  }

  async moreLikeThis(documentId: string, limit = 10): Promise<SearchResult[]> {
    const response = await this.client.search({
      index: this.indexName,
      size: limit,
      body: {
        query: {
          more_like_this: {
            fields: ['content_en', 'content_th', 'title_en', 'title_th'],
            like: [
              {
                _index: this.indexName,
                _id: documentId,
              },
            ],
            min_term_freq: 1,
            min_doc_freq: 1,
          },
        },
      },
    });

    return response.hits.hits.map((hit: any) => ({
      id: hit._id,
      documentId: hit._source.document_id,
      titleEn: hit._source.title_en,
      titleTh: hit._source.title_th,
      summaryEn: hit._source.summary_en,
      summaryTh: hit._source.summary_th,
      documentType: hit._source.document_type,
      publicationDate: hit._source.publication_date,
      score: hit._score,
    }));
  }

  async getTrends(query: TrendQuery): Promise<TrendData[]> {
    const { topic, dateFrom, dateTo, interval = 'month' } = query;

    const calendarInterval = interval === 'quarter' ? '1q' : interval === 'year' ? '1y' : '1M';

    const response = await this.client.search({
      index: this.indexName,
      size: 0,
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: topic,
                  fields: ['content_en', 'content_th', 'title_en', 'title_th', 'tags'],
                },
              },
            ],
            filter: [
              {
                range: {
                  publication_date: {
                    gte: dateFrom,
                    lte: dateTo,
                  },
                },
              },
            ],
          },
        },
        aggregations: {
          trends: {
            date_histogram: {
              field: 'publication_date',
              calendar_interval: calendarInterval,
              format: 'yyyy-MM-dd',
            },
          },
        },
      },
    });

    return (response.aggregations?.trends as any)?.buckets?.map((bucket: any) => ({
      date: bucket.key_as_string,
      count: bucket.doc_count,
    })) || [];
  }

  async suggest(prefix: string, field = 'title_th'): Promise<string[]> {
    const response = await this.client.search({
      index: this.indexName,
      size: 10,
      body: {
        query: {
          prefix: {
            [field]: {
              value: prefix,
            },
          },
        },
        _source: [field],
      },
    });

    return response.hits.hits.map((hit: any) => hit._source[field]).filter((v: any) => v);
  }

  private getSearchFields(language: 'en' | 'th' | 'both'): string[] {
    if (language === 'en') {
      return ['title_en^3', 'summary_en^2', 'content_en'];
    } else if (language === 'th') {
      return ['title_th^3', 'summary_th^2', 'content_th'];
    }
    return ['title_en^3', 'title_th^3', 'summary_en^2', 'summary_th^2', 'content_en', 'content_th'];
  }
}
