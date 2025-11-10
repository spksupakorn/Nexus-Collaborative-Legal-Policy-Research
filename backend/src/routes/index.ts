import { FastifyInstance } from 'fastify';
import { container } from '../config/inversify.config';
import { TYPES } from '../config/types';
import { AuthController } from '../controllers/AuthController';
import { SearchController } from '../controllers/SearchController';
import { DocumentController } from '../controllers/DocumentController';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { RoleType } from '../entities/Role';
import {
  authResponseSchema,
  userSchema,
  documentSchema,
  searchResponseSchema,
  dashboardStatsSchema,
  linkSchema,
  graphResponseSchema,
  annotationSchema,
  successResponseSchema,
  errorResponseSchema
} from '../schemas/responses';

export async function registerRoutes(server: FastifyInstance): Promise<void> {
  const authController = container.get<AuthController>(TYPES.AuthController);
  const searchController = container.get<SearchController>(TYPES.SearchController);
  const documentController = container.get<DocumentController>(TYPES.DocumentController);
  const dashboardController = container.get<DashboardController>('DashboardController');

  // API v1 prefix
  server.register(async (api) => {
    // Auth routes
    api.post('/auth/login', {
      schema: {
        description: 'Login with email and password',
        tags: ['Authentication'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  roles: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }, authController.login.bind(authController));
    
    api.post('/auth/register', {
      schema: {
        description: 'Register a new user',
        tags: ['Authentication'],
        body: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            firstName: { type: 'string' },
            lastName: { type: 'string' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  roles: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }, authController.register.bind(authController));
    
    api.get('/auth/me', { 
      preHandler: authMiddleware,
      schema: {
        description: 'Get current user profile',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        response: {
          200: userSchema,
          401: errorResponseSchema
        }
      }
    }, authController.me.bind(authController));

    // Dashboard route
    api.get('/dashboard', { 
      preHandler: authMiddleware,
      schema: {
        description: 'Get dashboard statistics',
        tags: ['Dashboard'],
        security: [{ bearerAuth: [] }],
        response: {
          200: dashboardStatsSchema,
          401: errorResponseSchema
        }
      }
    }, dashboardController.getDashboard.bind(dashboardController));

    // Search routes (accessible by all authenticated users)
    api.post('/search', { 
      preHandler: authMiddleware,
      schema: {
        description: 'Search documents',
        tags: ['Search'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['query'],
          properties: {
            query: { type: 'string' },
            language: { type: 'string', enum: ['en', 'th', 'both'] },
            page: { type: 'number', minimum: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100 },
            filters: {
              type: 'object',
              properties: {
                documentType: { type: 'array', items: { type: 'string' } },
                jurisdiction: { type: 'array', items: { type: 'string' } },
                tags: { type: 'array', items: { type: 'string' } },
                dateFrom: { type: 'string' },
                dateTo: { type: 'string' }
              }
            }
          }
        },
        response: {
          200: searchResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    }, searchController.search.bind(searchController));
    api.get('/search/more-like/:documentId', { preHandler: authMiddleware }, searchController.moreLikeThis.bind(searchController));
    api.post('/search/trends', { preHandler: authMiddleware }, searchController.trends.bind(searchController));
    api.get('/search/suggest', { preHandler: authMiddleware }, searchController.suggest.bind(searchController));

    // Document routes
    api.get('/documents', { 
      preHandler: authMiddleware,
      schema: {
        description: 'List all documents',
        tags: ['Documents'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'array',
            items: documentSchema
          },
          401: errorResponseSchema
        }
      }
    }, documentController.listDocuments.bind(documentController));
    
    api.get('/documents/:id', { 
      preHandler: authMiddleware,
      schema: {
        description: 'Get document by ID',
        tags: ['Documents'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' }
          }
        },
        response: {
          200: documentSchema,
          401: errorResponseSchema,
          404: errorResponseSchema
        }
      }
    }, documentController.getDocument.bind(documentController));
    
    // Admin only: create, update, delete documents
    api.post('/documents', {
      preHandler: requireRole(RoleType.ADMIN),
      schema: {
        description: 'Create a new document (Admin only)',
        tags: ['Documents'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['titleEn', 'titleTh', 'documentType'],
          properties: {
            titleEn: { type: 'string' },
            titleTh: { type: 'string' },
            summaryEn: { type: 'string' },
            summaryTh: { type: 'string' },
            contentEn: { type: 'string' },
            contentTh: { type: 'string' },
            documentType: { type: 'string', enum: ['LAW', 'REGULATION', 'CASE', 'POLICY', 'REPORT', 'ARTICLE'] },
            sourceUrl: { type: 'string', format: 'uri' },
            publicationDate: { type: 'string' },
            jurisdiction: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } }
          }
        },
        response: {
          201: documentSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema
        }
      }
    }, documentController.createDocument.bind(documentController));
    
    api.put('/documents/:id', {
      preHandler: requireRole(RoleType.ADMIN),
      schema: {
        description: 'Update a document (Admin only)',
        tags: ['Documents'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' }
          }
        },
        body: {
          type: 'object',
          properties: {
            titleEn: { type: 'string' },
            titleTh: { type: 'string' },
            summaryEn: { type: 'string' },
            summaryTh: { type: 'string' },
            contentEn: { type: 'string' },
            contentTh: { type: 'string' },
            documentType: { type: 'string' },
            sourceUrl: { type: 'string' },
            publicationDate: { type: 'string' },
            jurisdiction: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } }
          }
        },
        response: {
          200: documentSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema
        }
      }
    }, documentController.updateDocument.bind(documentController));
    
    api.delete('/documents/:id', {
      preHandler: requireRole(RoleType.ADMIN),
      schema: {
        description: 'Delete a document (Admin only)',
        tags: ['Documents'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' }
          }
        },
        response: {
          200: successResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema
        }
      }
    }, documentController.deleteDocument.bind(documentController));

    // Document links (researchers and admins can create/delete)
    api.get('/documents/:id/links', {
      preHandler: authMiddleware,
      schema: {
        response: {
          200: { type: 'array', items: linkSchema },
          401: errorResponseSchema,
          404: errorResponseSchema
        }
      }
    }, documentController.getDocumentLinks.bind(documentController));
    
    api.get('/documents/:id/graph', {
      preHandler: authMiddleware,
      schema: {
        response: {
          200: graphResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema
        }
      }
    }, documentController.getLinksGraph.bind(documentController));
    
    api.post('/documents/:id/links', {
      preHandler: requireRole(RoleType.RESEARCHER, RoleType.ADMIN),
      schema: {
        response: {
          201: linkSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema
        }
      }
    }, documentController.createLink.bind(documentController));
    
    api.delete('/links/:linkId', {
      preHandler: requireRole(RoleType.RESEARCHER, RoleType.ADMIN),
      schema: {
        response: {
          200: successResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema
        }
      }
    }, documentController.deleteLink.bind(documentController));

    // Annotations (researchers and admins can create/update/delete)
    api.get('/documents/:id/annotations', {
      preHandler: authMiddleware,
      schema: {
        response: {
          200: { type: 'array', items: annotationSchema },
          401: errorResponseSchema,
          404: errorResponseSchema
        }
      }
    }, documentController.getAnnotations.bind(documentController));
    
    api.post('/documents/:id/annotations', {
      preHandler: requireRole(RoleType.RESEARCHER, RoleType.ADMIN),
      schema: {
        response: {
          201: annotationSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema
        }
      }
    }, documentController.createAnnotation.bind(documentController));
    
    api.put('/annotations/:annotationId', {
      preHandler: requireRole(RoleType.RESEARCHER, RoleType.ADMIN),
      schema: {
        response: {
          200: annotationSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema
        }
      }
    }, documentController.updateAnnotation.bind(documentController));
    
    api.delete('/annotations/:annotationId', {
      preHandler: requireRole(RoleType.RESEARCHER, RoleType.ADMIN),
      schema: {
        response: {
          200: successResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema
        }
      }
    }, documentController.deleteAnnotation.bind(documentController));

  }, { prefix: '/api/v1' });
}
