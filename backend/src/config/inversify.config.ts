import { Container } from 'inversify';
import { TYPES } from './types';

// Services
import { IAuthService } from '../interfaces/IAuthService';
import { AuthService } from '../services/AuthService';
import { IUserService } from '../interfaces/IUserService';
import { UserService } from '../services/UserService';
import { IDocumentService } from '../interfaces/IDocumentService';
import { DocumentService } from '../services/DocumentService';
import { ISearchService } from '../interfaces/ISearchService';
import { SearchService } from '../services/SearchService';
import { ILinkService } from '../interfaces/ILinkService';
import { LinkService } from '../services/LinkService';
import { IAnnotationService } from '../interfaces/IAnnotationService';
import { AnnotationService } from '../services/AnnotationService';
import { IElasticsearchService } from '../interfaces/IElasticsearchService';
import { ElasticsearchService } from '../services/ElasticsearchService';

// Controllers
import { AuthController } from '../controllers/AuthController';
import { DocumentController } from '../controllers/DocumentController';
import { SearchController } from '../controllers/SearchController';

const container = new Container();

// Bind services
container.bind<IAuthService>(TYPES.IAuthService).to(AuthService);
container.bind<IUserService>(TYPES.IUserService).to(UserService);
container.bind<IDocumentService>(TYPES.IDocumentService).to(DocumentService);
container.bind<ISearchService>(TYPES.ISearchService).to(SearchService);
container.bind<ILinkService>(TYPES.ILinkService).to(LinkService);
container.bind<IAnnotationService>(TYPES.IAnnotationService).to(AnnotationService);
container.bind<IElasticsearchService>(TYPES.IElasticsearchService).to(ElasticsearchService);

// Bind controllers
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container.bind<DocumentController>(TYPES.DocumentController).to(DocumentController);
container.bind<SearchController>(TYPES.SearchController).to(SearchController);

export { container };
