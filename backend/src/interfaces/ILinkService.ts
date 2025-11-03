import { DocumentLink, LinkType } from '../entities/DocumentLink';

export interface CreateLinkDTO {
  sourceDocumentId: string;
  targetDocumentId: string;
  linkType: LinkType;
  description?: string;
}

export interface LinkWithDocument {
  id: string;
  linkType: LinkType;
  description?: string;
  document: {
    id: string;
    titleEn: string;
    titleTh: string;
    documentType: string;
  };
  createdAt: Date;
}

export interface ILinkService {
  create(linkData: CreateLinkDTO): Promise<DocumentLink>;
  delete(id: string): Promise<void>;
  getDocumentLinks(documentId: string): Promise<{
    outgoing: LinkWithDocument[];
    incoming: LinkWithDocument[];
  }>;
  getLinksGraph(documentId: string, depth?: number): Promise<any>;
}
