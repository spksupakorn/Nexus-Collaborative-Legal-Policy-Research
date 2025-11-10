import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/types';
import { ISearchService } from '../interfaces/ISearchService';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string(),
  filters: z
    .object({
      documentType: z.array(z.string()).optional(),
      jurisdiction: z.array(z.string()).optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  language: z.enum(['en', 'th', 'both']).optional(),
});

const trendSchema = z.object({
  topic: z.string(),
  dateFrom: z.string(),
  dateTo: z.string(),
  interval: z.enum(['month', 'quarter', 'year']).optional(),
});

@injectable()
export class SearchController {
  constructor(
    @inject(TYPES.ISearchService) private searchService: ISearchService
  ) {}

  async search(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = searchSchema.parse(request.body);
      
      // Add userId from authenticated user
      const userId = (request as any).user?.id;
      const searchQuery = { ...query, userId };
      
      const results = await this.searchService.search(searchQuery);
      
      return reply.code(200).send(results);
    } catch (error: any) {
      return reply.code(400).send({
        error: error.message || 'Search failed',
      });
    }
  }

  async moreLikeThis(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { documentId } = request.params as { documentId: string };
      const { limit } = request.query as { limit?: number };
      
      const results = await this.searchService.moreLikeThis(
        documentId,
        limit ? parseInt(String(limit)) : 10
      );
      
      return reply.code(200).send(results);
    } catch (error: any) {
      return reply.code(400).send({
        error: error.message || 'More like this search failed',
      });
    }
  }

  async trends(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = trendSchema.parse(request.body);
      
      const results = await this.searchService.getTrends(query);
      
      return reply.code(200).send(results);
    } catch (error: any) {
      return reply.code(400).send({
        error: error.message || 'Trend analysis failed',
      });
    }
  }

  async suggest(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { prefix, field } = request.query as { prefix: string; field?: string };
      
      if (!prefix) {
        return reply.code(400).send({ error: 'Prefix parameter is required' });
      }
      
      const results = await this.searchService.suggest(prefix, field);
      
      return reply.code(200).send(results);
    } catch (error: any) {
      return reply.code(400).send({
        error: error.message || 'Suggestion failed',
      });
    }
  }
}
