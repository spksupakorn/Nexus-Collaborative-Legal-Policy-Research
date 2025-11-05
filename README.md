# Nexus - Collaborative Legal & Policy Research Hub

> A powerful knowledge discovery platform for legal professionals, academics, and policymakers to search, analyze, and connect legal documents with full Thai/English bilingual support.

## ✨ What is Nexus?

Nexus is a comprehensive research platform designed specifically for the legal and policy research community. It combines advanced search capabilities, knowledge graph visualization, and collaborative tools to help you discover connections between laws, regulations, cases, and policies across Thai and English languages.

## 🎯 Key Features

### 🔍 Smart Bilingual Search
- **Full-text search** across laws, regulations, cases, and policies
- **Thai language support** with ICU tokenizer for accurate Thai word segmentation
- **Intelligent language detection** - automatically shows results in the language you searched
- **Search in Thai** (พระราชบัญญัติ, กฎหมาย) or English (law, act, regulation)
- **Advanced filters**: Document type, jurisdiction, publication date, tags
- **Highlighted snippets** showing exactly where your keywords appear

### 🌐 Bilingual Content Management
- Every document has both **Thai and English versions**
- **Language toggle** on detail pages to switch between Thai/English
- Consistent metadata across both languages
- Smart display: English search shows English content, Thai search shows Thai content

### 📊 Analytics Dashboard
Three powerful views for data analysis:
1. **Overview**: Total documents, recent activity, quick statistics
2. **Knowledge Graph**: Interactive visualization of document relationships and citations
3. **Trend Analysis**: Charts showing document growth, search patterns, category distribution

### 🔐 Role-Based Access Control (RBAC)
- **Guest**: Read-only access to search and view documents
- **Researcher**: Can create annotations and document links
- **Admin**: Full access to create, edit, and delete documents

### 💾 Persistent Sessions
- **Stay logged in** across browser tabs and sessions
- Automatic token refresh
- Secure JWT authentication

## 🏗️ Technology Stack

### Backend (Node.js + TypeScript)
| Component | Technology | Purpose |
|-----------|-----------|---------|
| API Framework | Fastify 4.25 | High-performance REST API |
| Language | TypeScript 5.3 | Type-safe development |
| DI Container | InversifyJS 6.0 | Clean architecture with IoC |
| Database ORM | TypeORM 0.3.19 | PostgreSQL data management |
| Search Engine | Elasticsearch 8.11 | Full-text search with Thai support |
| Authentication | @fastify/jwt | JWT with RBAC |

### Frontend (Next.js + React)
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | Next.js 14 App Router | Modern React framework |
| Language | TypeScript 5.3 | Type-safe UI development |
| State Management | Zustand 4.4 | Simple, persistent state |
| Data Fetching | React Query 5.17 | Server state management |
| Styling | Tailwind CSS 3.4 | Utility-first CSS |
| Visualizations | ReactFlow 11 + Recharts 2 | Interactive graphs and charts |

### Infrastructure
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Next.js UI     │────▶│  Fastify API     │────▶│  PostgreSQL     │
│  Port 3000      │     │  Port 3001       │     │  Port 5432      │
│  (React 18)     │     │  (TypeScript)    │     │  (Documents DB) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ├──────────────────┐
                               ▼                  ▼
                        ┌─────────────────┐ ┌─────────────────┐
                        │ Elasticsearch   │ │ Kibana          │
                        │ Port 9200       │ │ Port 5601       │
                        │ (Thai Search)   │ │ (Analytics UI)  │
                        └─────────────────┘ └─────────────────┘
```

## � Quick Start (5 Minutes)

### Prerequisites
```bash
✅ Node.js >= 18.0.0
✅ Docker & Docker Compose
✅ npm >= 9.0.0
```

### Installation Steps

**1. Clone and Install**
```bash
git clone https://github.com/spksupakorn/Nexus-Collaborative-Legal-Policy-Research.git
cd Nexus-Collaborative-Legal-Policy-Research

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies  
cd frontend && npm install && cd ..
```

**2. Start All Services** (Recommended - using Docker)
```bash
docker-compose up -d
```

**3. Initialize Elasticsearch Index**
```bash
# Create the search index with Thai language support
docker exec -it nexus-api node dist/scripts/init-elasticsearch.js
```

**4. Access the Application** 🎉
| Service | URL | Description |
|---------|-----|-------------|
| 🌐 **Frontend** | http://localhost:3000 | Main application UI |
| 🔌 **API** | http://localhost:3001 | REST API endpoints |
| 📚 **Swagger Docs** | http://localhost:3001/docs | Interactive API documentation |
| 📊 **Kibana** | http://localhost:5601 | Elasticsearch analytics |

### First-Time Setup

**Create Your Admin Account:**
1. Open http://localhost:3000
2. Click "Login" → "Register"
3. Fill in your details
4. Use SQL to upgrade to Admin role:

```sql
docker exec -it nexus-postgres psql -U nexus_user -d nexus_db

-- Add ADMIN role to your user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'your@email.com' 
  AND r.name = 'ROLE_ADMIN';
```

**Add Your First Document:**
- Login as Admin
- Go to http://localhost:3001/docs
- Use POST /api/v1/documents endpoint
- Or use curl (see TESTING_GUIDE.md)

That's it! You're ready to search and analyze documents. 🚀

## 📖 Usage Guide

### Searching Documents

**1. Login to the application**
- Visit http://localhost:3000/login
- Use your registered credentials

**2. Navigate to Search**
- Click "ค้นหา / Search" in the header
- Or go to http://localhost:3000/search

**3. Enter your search query**
- **Thai keywords**: พระราชบัญญัติ, กฎหมาย, นโยบาย
- **English keywords**: law, act, regulation, policy
- The system will automatically show results in the language you searched

**4. Use filters** (optional)
- Document Type: Law, Policy, Regulation, Research
- Click document type buttons to filter

**5. View results**
- See titles, summaries, and highlighted content
- Click "ดูรายละเอียด / View Details →" for full document

### Viewing Document Details

**On the document detail page:**
- Toggle between Thai/English using the language switcher
- View full content, metadata, and tags
- See publication date and jurisdiction
- Access source URLs if available

### Dashboard Analytics

**Visit http://localhost:3000/dashboard to see:**
- **Overview Tab**: Statistics and recent activity
- **Knowledge Graph Tab**: Visual network of document relationships
- **Trend Analysis Tab**: Charts showing document trends over time

### Managing Your Session

**Persistent Login:**
- Your session persists across browser tabs
- Close and reopen - you stay logged in
- Only need to login again when token expires

**Logout:**
- Click "ออกจากระบบ / Logout" in the header

## 🔐 User Roles & Permissions

| Role | What You Can Do |
|------|----------------|
| **👤 GUEST** | • Search all documents<br>• View document details<br>• Access dashboard analytics |
| **🔬 RESEARCHER** | • Everything GUEST can do<br>• Create document annotations<br>• Link related documents<br>• Create private notes |
| **⚡ ADMIN** | • Everything RESEARCHER can do<br>• Create/edit/delete documents<br>• Manage users and roles<br>• Full system access |

**Note:** New users automatically get GUEST role. Contact an admin to upgrade to RESEARCHER or ADMIN.

## � API Reference

**Complete API documentation available at:** http://localhost:3001/docs (Swagger UI)

### Key Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| **Authentication** |
| POST | `/api/v1/auth/register` | Create new user account | ❌ No |
| POST | `/api/v1/auth/login` | Login and get JWT token | ❌ No |
| GET | `/api/v1/auth/me` | Get current user profile | ✅ Yes |
| **Search** |
| POST | `/api/v1/search` | Search documents with filters | ✅ Yes |
| GET | `/api/v1/search/more-like/:id` | Find similar documents | ✅ Yes |
| GET | `/api/v1/search/suggest` | Get search suggestions | ✅ Yes |
| **Documents** |
| GET | `/api/v1/documents` | List all documents | ✅ Yes |
| GET | `/api/v1/documents/:id` | Get document details | ✅ Yes |
| POST | `/api/v1/documents` | Create document | ✅ Admin only |
| PUT | `/api/v1/documents/:id` | Update document | ✅ Admin only |
| DELETE | `/api/v1/documents/:id` | Delete document | ✅ Admin only |
| **Dashboard** |
| GET | `/api/v1/dashboard` | Get analytics data | ✅ Yes |

### Example: Search Documents

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/search \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "พัฒนาดิจิทัล",
    "language": "th",
    "page": 1,
    "limit": 10
  }'
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "titleTh": "พระราชบัญญัติการพัฒนาดิจิทัล...",
      "titleEn": "Digital Development Act...",
      "documentType": "LAW",
      "score": 0.863
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

For detailed API documentation with interactive testing, visit the **Swagger UI** at http://localhost:3001/docs
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

## 🧪 Testing

Comprehensive testing guide available at: **[TESTING_GUIDE.md](./TESTING_GUIDE.md)**

### Quick Test Commands

```bash
# Check all services are running
docker-compose ps

# Test API health
curl http://localhost:3001/health

# Test search
curl -X POST http://localhost:3001/api/v1/search \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"digital"}'

# Reindex documents (if search not working)
docker exec nexus-api node dist/scripts/reindex-documents.js
```

## � Project Structure

```
Nexus-Collaborative-Legal-Policy-Research/
├── 📂 backend/                      # Node.js + TypeScript API
│   ├── src/
│   │   ├── config/                  # Database, DI, Elasticsearch setup
│   │   ├── controllers/             # API request handlers
│   │   ├── services/                # Business logic layer
│   │   ├── entities/                # TypeORM database models
│   │   ├── interfaces/              # TypeScript interfaces
│   │   ├── middleware/              # Auth & RBAC middleware
│   │   ├── routes/                  # API route definitions
│   │   └── scripts/                 # Utility scripts (reindex, init)
│   └── package.json
│
├── 📂 frontend/                     # Next.js 14 + React UI
│   ├── src/
│   │   ├── app/                     # Next.js App Router pages
│   │   │   ├── page.tsx            # Home page
│   │   │   ├── login/              # Login & register
│   │   │   ├── search/             # Search interface
│   │   │   ├── dashboard/          # Analytics dashboard
│   │   │   └── documents/[id]/     # Document detail page
│   │   ├── components/              # React components
│   │   │   ├── KnowledgeGraph.tsx  # ReactFlow graph viz
│   │   │   └── TrendAnalysis.tsx   # Recharts analytics
│   │   ├── store/                   # Zustand state management
│   │   └── styles/                  # Tailwind CSS
│   └── package.json
│
├── 📂 elasticsearch/                # Custom Elasticsearch with Thai plugin
├── 📄 docker-compose.yml           # All services orchestration
├── 📄 TESTING_GUIDE.md            # Complete testing instructions
├── 📄 DASHBOARD_GUIDE.md          # Dashboard features guide
└── 📄 README.md                    # This file
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** | Complete testing instructions, API examples, troubleshooting |
| **[DASHBOARD_GUIDE.md](./DASHBOARD_GUIDE.md)** | Dashboard features and analytics usage |
| **[Swagger UI](http://localhost:3001/docs)** | Interactive API documentation (when running) |

## 🔧 Troubleshooting

### Common Issues

**Search returns no results**
```bash
# Reindex documents from PostgreSQL to Elasticsearch
docker exec nexus-api node dist/scripts/reindex-documents.js
```

**Thai search not working**
```bash
# Check if Thai analyzer is applied to fields
curl http://localhost:9200/legal_docs/_mapping | jq
# Should show "analyzer": "thai_analyzer" for Thai fields
```

**Port already in use**
```bash
# Change ports in docker-compose.yml
# Or stop conflicting services
docker ps  # Find conflicting containers
docker stop <container_name>
```

**Frontend build errors**
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 💡 Next Steps
1. Add unit and integration tests
2. Configure production deployment

## 🤝 Contributing

Contributions welcome! Steps:
1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details

## � Author

**Supakorn** - [@spksupakorn](https://github.com/spksupakorn)

## 🙏 Acknowledgments

- 🇹🇭 Thai language support powered by **ICU Tokenizer**
- 🏗️ Clean architecture with **InversifyJS** dependency injection
- ⚡ High-performance search with **Elasticsearch 8.11**
- 🎨 Modern UI with **Next.js 14** and **Tailwind CSS**
- Built to improve legal research accessibility in Thailand

---

**Need Help?** Check [TESTING_GUIDE.md](./TESTING_GUIDE.md) or open an issue!
