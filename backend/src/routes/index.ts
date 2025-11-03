import { FastifyInstance } from 'fastify';
import { container } from './config/inversify.config';
import { TYPES } from './config/types';
import { AuthController } from './controllers/AuthController';
import { SearchController } from './controllers/SearchController';
import { DocumentController } from './controllers/DocumentController';
import { authMiddleware, requireRole } from './middleware/auth.middleware';
import { RoleType } from './entities/Role';

export async function registerRoutes(server: FastifyInstance): Promise<void> {
  const authController = container.get<AuthController>(TYPES.AuthController);
  const searchController = container.get<SearchController>(TYPES.SearchController);
  const documentController = container.get<DocumentController>(TYPES.DocumentController);

  // API v1 prefix
  server.register(async (api) => {
    // Auth routes
    api.post('/auth/login', authController.login.bind(authController));
    api.post('/auth/register', authController.register.bind(authController));
    api.get('/auth/me', { preHandler: authMiddleware }, authController.me.bind(authController));

    // Search routes (accessible by all authenticated users)
    api.post('/search', { preHandler: authMiddleware }, searchController.search.bind(searchController));
    api.get('/search/more-like/:documentId', { preHandler: authMiddleware }, searchController.moreLikeThis.bind(searchController));
    api.post('/search/trends', { preHandler: authMiddleware }, searchController.trends.bind(searchController));
    api.get('/search/suggest', { preHandler: authMiddleware }, searchController.suggest.bind(searchController));

    // Document routes
    api.get('/documents', { preHandler: authMiddleware }, documentController.listDocuments.bind(documentController));
    api.get('/documents/:id', { preHandler: authMiddleware }, documentController.getDocument.bind(documentController));
    
    // Admin only: create, update, delete documents
    api.post('/documents', {
      preHandler: requireRole(RoleType.ADMIN),
    }, documentController.createDocument.bind(documentController));
    
    api.put('/documents/:id', {
      preHandler: requireRole(RoleType.ADMIN),
    }, documentController.updateDocument.bind(documentController));
    
    api.delete('/documents/:id', {
      preHandler: requireRole(RoleType.ADMIN),
    }, documentController.deleteDocument.bind(documentController));

    // Document links (researchers and admins can create/delete)
    api.get('/documents/:id/links', { preHandler: authMiddleware }, documentController.getDocumentLinks.bind(documentController));
    api.get('/documents/:id/graph', { preHandler: authMiddleware }, documentController.getLinksGraph.bind(documentController));
    
    api.post('/documents/:id/links', {
      preHandler: requireRole(RoleType.RESEARCHER, RoleType.ADMIN),
    }, documentController.createLink.bind(documentController));
    
    api.delete('/links/:linkId', {
      preHandler: requireRole(RoleType.RESEARCHER, RoleType.ADMIN),
    }, documentController.deleteLink.bind(documentController));

    // Annotations (researchers and admins can create/update/delete)
    api.get('/documents/:id/annotations', { preHandler: authMiddleware }, documentController.getAnnotations.bind(documentController));
    
    api.post('/documents/:id/annotations', {
      preHandler: requireRole(RoleType.RESEARCHER, RoleType.ADMIN),
    }, documentController.createAnnotation.bind(documentController));
    
    api.put('/annotations/:annotationId', {
      preHandler: requireRole(RoleType.RESEARCHER, RoleType.ADMIN),
    }, documentController.updateAnnotation.bind(documentController));
    
    api.delete('/annotations/:annotationId', {
      preHandler: requireRole(RoleType.RESEARCHER, RoleType.ADMIN),
    }, documentController.deleteAnnotation.bind(documentController));

  }, { prefix: '/api/v1' });
}
