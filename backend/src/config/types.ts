export const TYPES = {
  // Services
  IAuthService: Symbol.for('IAuthService'),
  IUserService: Symbol.for('IUserService'),
  IDocumentService: Symbol.for('IDocumentService'),
  ISearchService: Symbol.for('ISearchService'),
  ILinkService: Symbol.for('ILinkService'),
  IAnnotationService: Symbol.for('IAnnotationService'),
  IElasticsearchService: Symbol.for('IElasticsearchService'),

  // Controllers
  AuthController: Symbol.for('AuthController'),
  DocumentController: Symbol.for('DocumentController'),
  SearchController: Symbol.for('SearchController'),
};
