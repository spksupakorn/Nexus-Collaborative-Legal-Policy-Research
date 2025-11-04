# Nexus - Collaborative Legal & Policy Research Hub

A powerful knowledge discovery platform for lawyers, paralegals, academics, and policymakers to search, analyze, and connect legal documents, case law, and government policies with full Thai language support.

## 🚀 Key Features

### Multi-Faceted Document Search
- Search millions of documents (laws, regulations, case precedents, academic articles)
- Full-text search with Thai language support using ICU tokenizer
- Advanced filtering by document type, jurisdiction, date ranges, and tags
- Faceted search with real-time aggregations

### Cross-Language Support (Thai/English)
- Bilingual search capabilities
- Search in Thai (e.g., "พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล") and find related English analysis
- Thai language analysis powered by Elasticsearch ICU plugin

### Knowledge Graph & Citation Analysis
When viewing a document, the system provides:
- **Cited By**: Other cases or policies that reference this law
- **References**: Documents this law itself is based on
- **Related Academic Commentary**: Research papers analyzing this law
- Interactive graph visualization of document relationships

### Trend Analysis Dashboard
- Visualize regulatory trends over time
- Track volume of new regulations by topic per quarter/year
- Time-series analysis with customizable date ranges

### User-Generated Connections
- Researchers can manually link documents
- Add private annotations to documents
- Create custom relationships with descriptions

## 🏗️ Architecture

### Tech Stack

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Fastify (high-performance API framework)
- **Language**: TypeScript
- **Dependency Injection**: InversifyJS (clean architecture with IoC)
- **ORM**: TypeORM with PostgreSQL
- **Search Engine**: Elasticsearch 8.x with Thai ICU tokenizer
- **Authentication**: JWT with role-based access control (RBAC)

#### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **State Management**: Zustand + React Query
- **Styling**: Tailwind CSS
- **Visualization**: React Flow (knowledge graph), Recharts (trends)

#### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 16
- **Search**: Elasticsearch 8.11 with ICU analysis plugin
- **Analytics**: Kibana (optional, for ES visualization)

### System Design

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Next.js   │────────▶│   Fastify    │────────▶│  PostgreSQL  │
│   Frontend  │         │   Backend    │         │  (Metadata)  │
└─────────────┘         └──────────────┘         └──────────────┘
                               │
                               │
                               ▼
                        ┌──────────────┐
                        │Elasticsearch │
                        │ (Full-text)  │
                        └──────────────┘
```

## 📦 Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- Docker & Docker Compose
- npm >= 9.0.0

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/spksupakorn/Nexus-Collaborative-Legal-Policy-Research.git
cd Nexus-Collaborative-Legal-Policy-Research
```

2. **Copy environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Install dependencies**
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

4. **Start with Docker Compose** (Recommended)
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Elasticsearch on port 9200
- Kibana on port 5601
- Backend API on port 3001
- Frontend on port 3000

5. **Access the application**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- API Docs (Swagger): http://localhost:3001/docs
- Kibana: http://localhost:5601

### Development Mode (Without Docker)

1. **Start PostgreSQL** (locally or via Docker)
```bash
docker run -d \
  --name nexus-postgres \
  -e POSTGRES_DB=nexus_db \
  -e POSTGRES_USER=nexus_user \
  -e POSTGRES_PASSWORD=nexus_password \
  -p 5432:5432 \
  postgres:15-alpine
```

2. **Start Elasticsearch**
```bash
docker run -d \
  --name nexus-elasticsearch \
  -e "discovery.type=single-node" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  -e "xpack.security.enabled=false" \
  -p 9200:9200 \
  -p 9300:9300 \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

3. **Start Backend**
```bash
cd backend
npm run dev
```

4. **Start Frontend**
```bash
cd frontend
npm run dev
```

## 🔐 Role-Based Access Control (RBAC)

### Roles & Permissions

| Role | Permissions |
|------|-------------|
| **GUEST** | Search documents, view documents, view public annotations |
| **RESEARCHER** | All GUEST permissions + create annotations, create document links, view own private annotations |
| **ADMIN** | All RESEARCHER permissions + create/update/delete documents, manage users, manage all data |

### Default User Setup

After the database is initialized, you'll need to seed roles and an admin user:

```sql
-- Insert roles
INSERT INTO roles (name, description) VALUES
  ('ROLE_GUEST', 'Can search and view documents'),
  ('ROLE_RESEARCHER', 'Can annotate and link documents'),
  ('ROLE_ADMIN', 'Full system access');
```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/v1/auth/register`
Register a new user (default role: GUEST)
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST `/api/v1/auth/login`
Login and receive JWT token
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": [...]
  }
}
```

#### GET `/api/v1/auth/me`
Get current user info (requires authentication)

### Search Endpoints

#### POST `/api/v1/search`
Full-text search with filters
```json
{
  "query": "พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล",
  "language": "th",
  "filters": {
    "documentType": ["LAW", "REGULATION"],
    "dateFrom": "2020-01-01",
    "dateTo": "2024-12-31"
  },
  "page": 1,
  "limit": 20
}
```

#### GET `/api/v1/search/more-like/:documentId`
Find similar documents using MLT (More Like This)

#### POST `/api/v1/search/trends`
Get trend analysis data
```json
{
  "topic": "fintech",
  "dateFrom": "2019-01-01",
  "dateTo": "2024-12-31",
  "interval": "quarter"
}
```

### Document Endpoints

#### GET `/api/v1/documents`
List all documents (paginated)

#### GET `/api/v1/documents/:id`
Get document details

#### POST `/api/v1/documents` (ADMIN only)
Create a new document

#### PUT `/api/v1/documents/:id` (ADMIN only)
Update document

#### DELETE `/api/v1/documents/:id` (ADMIN only)
Delete document

### Link & Graph Endpoints

#### GET `/api/v1/documents/:id/links`
Get all links for a document (incoming & outgoing)

#### POST `/api/v1/documents/:id/links` (RESEARCHER+)
Create a link between documents
```json
{
  "targetDocumentId": "uuid",
  "linkType": "CITES",
  "description": "Optional description"
}
```

#### GET `/api/v1/documents/:id/graph?depth=2`
Get knowledge graph for document

### Annotation Endpoints

#### GET `/api/v1/documents/:id/annotations`
Get annotations for a document

#### POST `/api/v1/documents/:id/annotations` (RESEARCHER+)
Create annotation
```json
{
  "content": "This regulation conflicts with...",
  "isPrivate": true,
  "metadata": {"tags": ["conflict", "review"]}
}
```

## 🔍 Elasticsearch Index Configuration

### Thai Language Analysis

The system uses the ICU tokenizer for proper Thai word segmentation:

```json
{
  "settings": {
    "analysis": {
      "analyzer": {
        "thai_analyzer": {
          "type": "custom",
          "tokenizer": "icu_tokenizer",
          "filter": ["lowercase", "icu_folding"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "title_th": { "type": "text", "analyzer": "thai_analyzer" },
      "content_th": { "type": "text", "analyzer": "thai_analyzer" },
      "document_type": { "type": "keyword" },
      "publication_date": { "type": "date" }
    }
  }
}
```

## 🚢 Deployment

### Production Build

1. **Build backend**
```bash
cd backend
npm run build
```

2. **Build frontend**
```bash
cd frontend
npm run build
```

3. **Start production**
```bash
# Using Docker Compose
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Environment Variables

Key environment variables for production:

```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
DB_PASSWORD=<secure-password>
CORS_ORIGIN=https://your-domain.com
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📖 Project Structure

```
nexus/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   │   ├── database.ts
│   │   │   ├── inversify.config.ts
│   │   │   ├── elasticsearch.config.ts
│   │   │   └── types.ts
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── entities/        # TypeORM entities
│   │   ├── interfaces/      # Service interfaces
│   │   ├── middleware/      # Auth & RBAC middleware
│   │   ├── routes/          # API routes
│   │   ├── index.ts         # Entry point
│   │   └── server.ts        # Fastify server setup
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js 14 app directory
│   │   ├── components/      # React components
│   │   ├── lib/             # API client & utilities
│   │   ├── store/           # Zustand stores
│   │   ├── types/           # TypeScript types
│   │   └── styles/          # Global styles
│   ├── Dockerfile
│   └── package.json
├── elasticsearch/
│   └── Dockerfile           # ES with Thai plugin
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Supakorn** - [@spksupakorn](https://github.com/spksupakorn)

## 🙏 Acknowledgments

- Thai language processing powered by ICU tokenizer
- Built with modern TypeScript best practices
- Inspired by the need for better legal research tools in Thailand
