import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/types';
import { IDocumentService } from '../interfaces/IDocumentService';
import { ILinkService } from '../interfaces/ILinkService';
import { IAnnotationService } from '../interfaces/IAnnotationService';
import { z } from 'zod';
import { DocumentType } from '../entities/Document';
import { LinkType } from '../entities/DocumentLink';

const createDocumentSchema = z.object({
  titleEn: z.string(),
  titleTh: z.string(),
  summaryEn: z.string().optional(),
  summaryTh: z.string().optional(),
  contentEn: z.string().optional(),
  contentTh: z.string().optional(),
  documentType: z.nativeEnum(DocumentType),
  sourceUrl: z.string().url().optional(),
  publicationDate: z.string().optional(),
  jurisdiction: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const createLinkSchema = z.object({
  targetDocumentId: z.string().uuid(),
  linkType: z.nativeEnum(LinkType),
  description: z.string().optional(),
});

const createAnnotationSchema = z.object({
  content: z.string(),
  isPrivate: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

@injectable()
export class DocumentController {
  constructor(
    @inject(TYPES.IDocumentService) private documentService: IDocumentService,
    @inject(TYPES.ILinkService) private linkService: ILinkService,
    @inject(TYPES.IAnnotationService) private annotationService: IAnnotationService
  ) {}

  async getDocument(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      
      const document = await this.documentService.findById(id);
      
      if (!document) {
        return reply.code(404).send({ error: 'Document not found' });
      }
      
      return reply.code(200).send(document);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async createDocument(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createDocumentSchema.parse(request.body);
      
      const document = await this.documentService.create(data as any);
      
      return reply.code(201).send(document);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async updateDocument(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const data = request.body as any;
      
      const document = await this.documentService.update(id, data);
      
      return reply.code(200).send(document);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async deleteDocument(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      
      await this.documentService.delete(id);
      
      return reply.code(204).send();
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async listDocuments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 20 } = request.query as { page?: number; limit?: number };
      
      const result = await this.documentService.findAll(
        parseInt(String(page)),
        parseInt(String(limit))
      );
      
      return reply.code(200).send(result);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async getDocumentLinks(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      
      const links = await this.linkService.getDocumentLinks(id);
      
      return reply.code(200).send(links);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async createLink(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const data = createLinkSchema.parse(request.body);
      
      const link = await this.linkService.create({
        sourceDocumentId: id,
        ...data,
      });
      
      return reply.code(201).send(link);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async deleteLink(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { linkId } = request.params as { linkId: string };
      
      await this.linkService.delete(linkId);
      
      return reply.code(204).send();
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async getLinksGraph(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { depth = 2 } = request.query as { depth?: number };
      
      const graph = await this.linkService.getLinksGraph(id, parseInt(String(depth)));
      
      return reply.code(200).send(graph);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async getAnnotations(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const user = (request as any).user;
      
      const annotations = await this.annotationService.findByDocument(
        id,
        user?.id
      );
      
      return reply.code(200).send(annotations);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async createAnnotation(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const user = (request as any).user;
      const data = createAnnotationSchema.parse(request.body);
      
      if (!user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      
      const annotation = await this.annotationService.create({
        userId: user.id,
        documentId: id,
        ...data,
      });
      
      return reply.code(201).send(annotation);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async updateAnnotation(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { annotationId } = request.params as { annotationId: string };
      const user = (request as any).user;
      const data = request.body as any;
      
      if (!user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      
      const annotation = await this.annotationService.update(
        annotationId,
        user.id,
        data
      );
      
      return reply.code(200).send(annotation);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async deleteAnnotation(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { annotationId } = request.params as { annotationId: string };
      const user = (request as any).user;
      
      if (!user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      
      await this.annotationService.delete(annotationId, user.id);
      
      return reply.code(204).send();
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }
}
