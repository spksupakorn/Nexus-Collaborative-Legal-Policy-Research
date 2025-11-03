export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
}

export interface Role {
  id: string;
  name: 'ROLE_GUEST' | 'ROLE_RESEARCHER' | 'ROLE_ADMIN';
  description?: string;
}

export interface Document {
  id: string;
  titleEn: string;
  titleTh: string;
  summaryEn?: string;
  summaryTh?: string;
  contentEn?: string;
  contentTh?: string;
  documentType: DocumentType;
  sourceUrl?: string;
  publicationDate?: string;
  jurisdiction?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export enum DocumentType {
  LAW = 'LAW',
  REGULATION = 'REGULATION',
  CASE_LAW = 'CASE_LAW',
  POLICY = 'POLICY',
  ACADEMIC = 'ACADEMIC',
  TREATY = 'TREATY',
  OTHER = 'OTHER',
}

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

export interface DocumentLink {
  id: string;
  linkType: LinkType;
  description?: string;
  document: {
    id: string;
    titleEn: string;
    titleTh: string;
    documentType: string;
  };
  createdAt: string;
}

export enum LinkType {
  CITES = 'CITES',
  CITED_BY = 'CITED_BY',
  AMENDS = 'AMENDS',
  AMENDED_BY = 'AMENDED_BY',
  SUPERSEDES = 'SUPERSEDES',
  SUPERSEDED_BY = 'SUPERSEDED_BY',
  REFERENCES = 'REFERENCES',
  RELATED = 'RELATED',
  CONFLICTS_WITH = 'CONFLICTS_WITH',
}

export interface Annotation {
  id: string;
  content: string;
  isPrivate: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}
