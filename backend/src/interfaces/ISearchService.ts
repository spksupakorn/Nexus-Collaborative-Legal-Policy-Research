export interface SearchQuery {
  query: string;
  filters?: {
    documentType?: string[];
    jurisdiction?: string[];
    dateFrom?: string;
    dateTo?: string;
    tags?: string[];
  };
  page?: number;
  limit?: number;
  language?: 'en' | 'th' | 'both';
  userId?: string;
}

export interface SearchResult {
  id: string;
  documentId: string;
  titleEn: string;
  titleTh: string;
  summaryEn?: string;
  summaryTh?: string;
  documentType: string;
  publicationDate?: string;
  highlights?: Record<string, string[]>;
  score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  facets?: {
    documentTypes: Array<{ key: string; count: number }>;
    jurisdictions: Array<{ key: string; count: number }>;
    tags: Array<{ key: string; count: number }>;
  };
}

export interface TrendQuery {
  topic: string;
  dateFrom: string;
  dateTo: string;
  interval?: 'month' | 'quarter' | 'year';
}

export interface TrendData {
  date: string;
  count: number;
}

export interface ISearchService {
  search(query: SearchQuery): Promise<SearchResponse>;
  moreLikeThis(documentId: string, limit?: number): Promise<SearchResult[]>;
  getTrends(query: TrendQuery): Promise<TrendData[]>;
  suggest(prefix: string, field?: string): Promise<string[]>;
}
