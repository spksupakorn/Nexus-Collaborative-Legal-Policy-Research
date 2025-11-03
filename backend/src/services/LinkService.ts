import { injectable } from 'inversify';
import { AppDataSource } from '../config/database';
import { DocumentLink } from '../entities/DocumentLink';
import { Document } from '../entities/Document';
import { ILinkService, CreateLinkDTO, LinkWithDocument } from '../interfaces/ILinkService';

@injectable()
export class LinkService implements ILinkService {
  private linkRepository = AppDataSource.getRepository(DocumentLink);
  private documentRepository = AppDataSource.getRepository(Document);

  async create(linkData: CreateLinkDTO): Promise<DocumentLink> {
    const sourceDocument = await this.documentRepository.findOne({
      where: { id: linkData.sourceDocumentId },
    });

    const targetDocument = await this.documentRepository.findOne({
      where: { id: linkData.targetDocumentId },
    });

    if (!sourceDocument || !targetDocument) {
      throw new Error('Source or target document not found');
    }

    const link = this.linkRepository.create({
      sourceDocument,
      targetDocument,
      linkType: linkData.linkType,
      description: linkData.description,
    });

    return this.linkRepository.save(link);
  }

  async delete(id: string): Promise<void> {
    await this.linkRepository.delete(id);
  }

  async getDocumentLinks(documentId: string): Promise<{
    outgoing: LinkWithDocument[];
    incoming: LinkWithDocument[];
  }> {
    const outgoingLinks = await this.linkRepository.find({
      where: { sourceDocument: { id: documentId } },
      relations: ['targetDocument'],
    });

    const incomingLinks = await this.linkRepository.find({
      where: { targetDocument: { id: documentId } },
      relations: ['sourceDocument'],
    });

    const outgoing: LinkWithDocument[] = outgoingLinks.map((link) => ({
      id: link.id,
      linkType: link.linkType,
      description: link.description,
      document: {
        id: link.targetDocument.id,
        titleEn: link.targetDocument.titleEn,
        titleTh: link.targetDocument.titleTh,
        documentType: link.targetDocument.documentType,
      },
      createdAt: link.createdAt,
    }));

    const incoming: LinkWithDocument[] = incomingLinks.map((link) => ({
      id: link.id,
      linkType: link.linkType,
      description: link.description,
      document: {
        id: link.sourceDocument.id,
        titleEn: link.sourceDocument.titleEn,
        titleTh: link.sourceDocument.titleTh,
        documentType: link.sourceDocument.documentType,
      },
      createdAt: link.createdAt,
    }));

    return { outgoing, incoming };
  }

  async getLinksGraph(documentId: string, depth: number = 2): Promise<any> {
    // Simplified graph structure
    const nodes = new Map();
    const edges: any[] = [];
    const visited = new Set<string>();

    const traverse = async (currentId: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(currentId)) {
        return;
      }

      visited.add(currentId);

      const document = await this.documentRepository.findOne({
        where: { id: currentId },
      });

      if (document) {
        nodes.set(currentId, {
          id: document.id,
          titleEn: document.titleEn,
          titleTh: document.titleTh,
          documentType: document.documentType,
        });
      }

      const links = await this.getDocumentLinks(currentId);

      for (const link of links.outgoing) {
        edges.push({
          source: currentId,
          target: link.document.id,
          type: link.linkType,
        });

        if (currentDepth < depth) {
          await traverse(link.document.id, currentDepth + 1);
        }
      }

      for (const link of links.incoming) {
        edges.push({
          source: link.document.id,
          target: currentId,
          type: link.linkType,
        });

        if (currentDepth < depth) {
          await traverse(link.document.id, currentDepth + 1);
        }
      }
    };

    await traverse(documentId, 0);

    return {
      nodes: Array.from(nodes.values()),
      edges,
    };
  }
}
