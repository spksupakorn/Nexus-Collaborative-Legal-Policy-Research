# Nexus - Testing & Access Guide

## 🌐 Service Access URLs

### Frontend (Next.js)
- **URL**: http://localhost:3000
- **Status**: ✅ Running
- **Features**:
  - Landing page with feature overview
  - Thai/English language support
  - Links to Search and Login pages

### Backend API (Fastify)
- **URL**: http://localhost:3001
- **API Base**: http://localhost:3001/api/v1
- **Swagger Docs**: http://localhost:3001/docs
- **Status**: ✅ Running

### Database Services
- **PostgreSQL**: localhost:5432
  - Database: `nexus_db`
  - User: `nexus_user`
  - Password: `nexus_password`
  
- **Elasticsearch**: http://localhost:9200
  - Thai language analyzer configured
  - ICU tokenizer installed
  - **⚠️ Important**: Initialize index before searching (see setup below)

- **Kibana**: http://localhost:5601
  - Elasticsearch visualization tool

---

## ⚙️ Initial Setup (Required Once)

### Initialize Elasticsearch Index

**Before using search features, create the Elasticsearch index:**

```bash
# Method 1: Using Docker exec (Recommended)
docker exec -it nexus-api node -e "
const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://search:9200' });
async function init() {
  const exists = await client.indices.exists({ index: 'legal_docs' });
  if (exists) { console.log('✅ Index already exists'); return; }
  await client.indices.create({
    index: 'legal_docs',
    body: {
      settings: { analysis: { analyzer: { thai_analyzer: { type: 'custom', tokenizer: 'icu_tokenizer', filter: ['lowercase'] }}}},
      mappings: { properties: { id: {type:'keyword'}, titleEn: {type:'text'}, titleTh: {type:'text',analyzer:'thai_analyzer'}, contentEn: {type:'text'}, contentTh: {type:'text',analyzer:'thai_analyzer'}, documentType: {type:'keyword'}, tags: {type:'keyword'}}}
    }
  });
  console.log('✅ Index created!');
}
init().catch(console.error);
"

# Method 2: Quick verification
curl -X GET "http://localhost:9200/legal_docs" 2>/dev/null | jq '.legal_docs.mappings'
```

**Expected Output:**
```
✅ Index created successfully!
```

**If you see this error when searching:**
```json
{
  "error": "index_not_found_exception: no such index [legal_docs]"
}
```
**Solution**: Run the initialization command above.

---

## 🧪 API Testing Guide

### 1. Register a New User

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nexus.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@nexus.com",
    "firstName": "Admin",
    "lastName": "User",
    "roles": ["ROLE_GUEST"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nexus.com",
    "password": "admin123"
  }'
```

**Save the token from response for authenticated requests!**

### 3. Get Current User Profile

```bash
# Replace YOUR_TOKEN with the JWT token from login
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Search Documents (Requires Authentication)

```bash
curl -X POST http://localhost:3001/api/v1/search \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "กฎหมาย",
    "language": "th",
    "page": 1,
    "pageSize": 10
  }'
```

### 5. Create Document (Admin Only)

```bash
curl -X POST http://localhost:3001/api/v1/documents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titleEn": "Digital Economy Promotion Act",
    "titleTh": "พระราชบัญญัติส่งเสริมเศรษฐกิจดิจิทัล",
    "summaryEn": "An act to promote digital economy development",
    "summaryTh": "พระราชบัญญัติเพื่อส่งเสริมการพัฒนาเศรษฐกิจดิจิทัล",
    "contentEn": "Full text of the act...",
    "contentTh": "เนื้อหาฉบับเต็ม...",
    "documentType": "LAW",
    "jurisdiction": "Thailand",
    "sourceUrl": "https://example.com",
    "publicationDate": "2023-01-01",
    "tags": ["digital", "economy", "technology"]
  }'
```

---

## 🎯 Frontend Testing

### 1. Access Landing Page
Open your browser and navigate to:
```
http://localhost:3000
```

**What to verify:**
- ✅ Page loads with "Nexus" heading
- ✅ Thai and English text displayed
- ✅ Four feature cards visible
- ✅ "Start Searching" and "Login" buttons present
- ✅ Role descriptions at bottom

### 2. Test Navigation
- Click "Start Searching" → Should go to `/search` (page may not be implemented yet)
- Click "Login" → Should go to `/login` (page may not be implemented yet)

### 3. Check Responsive Design
- Resize browser window
- Verify layout adapts to mobile/tablet/desktop sizes

---

## 🔧 Docker Container Status

Check all services:
```bash
docker-compose ps
```

**Expected output:**
```
nexus-api            Up      0.0.0.0:3001->3001/tcp
nexus-elasticsearch  Up (healthy)  0.0.0.0:9200->9200/tcp
nexus-frontend       Up      0.0.0.0:3000->3000/tcp
nexus-kibana         Up      0.0.0.0:5601->5601/tcp
nexus-postgres       Up (healthy)  0.0.0.0:5432->5432/tcp
```

### View Logs

```bash
# Backend API logs
docker-compose logs api --tail=50

# Frontend logs
docker-compose logs web --tail=50

# All services
docker-compose logs --tail=50
```

### Restart Services

```bash
# Restart specific service
docker-compose restart api
docker-compose restart web

# Restart all services
docker-compose restart
```

---

## 📊 Database Testing

### Connect to PostgreSQL

```bash
docker exec -it nexus-postgres psql -U nexus_user -d nexus_db
```

### Check Tables

```sql
-- List all tables
\dt

-- View users
SELECT * FROM users;

-- View roles
SELECT * FROM roles;

-- View documents
SELECT * FROM documents;
```

### Check Elasticsearch

```bash
# Check cluster health
curl http://localhost:9200/_cluster/health?pretty

# List all indices
curl http://localhost:9200/_cat/indices

# Check if legal_docs index exists (correct index name)
curl http://localhost:9200/legal_docs

# Count documents in index
curl http://localhost:9200/legal_docs/_count

# View first document
curl http://localhost:9200/legal_docs/_search?size=1 | jq

# Search for Thai word "พัฒนา"
curl -X POST http://localhost:9200/legal_docs/_search \
  -H "Content-Type: application/json" \
  -d '{"query":{"multi_match":{"query":"พัฒนา","fields":["title_th","content_th"]}}}' | jq
```

---

## � Using Kibana for Search & Analytics

### Access Kibana

Open your browser and go to: **http://localhost:5601**

### Step 1: Create Index Pattern

**First time only - Create index pattern to view data:**

1. Open Kibana at http://localhost:5601
2. Click **☰ Menu** (hamburger icon) → **Management** → **Stack Management**
3. Under **Kibana**, click **Index Patterns**
4. Click **Create index pattern**
5. Enter index pattern: `legal_docs`
6. Click **Next step**
7. Select time field: `created_at` (or `@timestamp` if available)
8. Click **Create index pattern**

✅ Now you can search and analyze your documents!

### Step 2: Search Documents in Discover

1. Click **☰ Menu** → **Analytics** → **Discover**
2. Make sure `legal_docs` is selected in the dropdown
3. You'll see all your documents

**Search Examples:**

| Search Query | What It Does |
|-------------|--------------|
| `title_th:พัฒนา` | Find documents with "พัฒนา" in Thai title |
| `title_en:digital` | Find documents with "digital" in English title |
| `document_type:LAW` | Filter by document type |
| `jurisdiction:Thailand` | Filter by jurisdiction |
| `tags:technology` | Find documents tagged with "technology" |

**Advanced Search (KQL - Kibana Query Language):**

```
title_th:พัฒนา AND document_type:LAW
```

```
(title_en:digital OR content_en:technology) AND jurisdiction:Thailand
```

### Step 3: Test Thai Search

**In Kibana Dev Tools (Console):**

1. Click **☰ Menu** → **Management** → **Dev Tools**
2. Try these queries:

**Search for Thai word:**
```json
POST /legal_docs/_search
{
  "query": {
    "multi_match": {
      "query": "พัฒนา",
      "fields": ["title_th^3", "summary_th^2", "content_th"]
    }
  }
}
```

**Search for English word:**
```json
POST /legal_docs/_search
{
  "query": {
    "multi_match": {
      "query": "digital",
      "fields": ["title_en^3", "summary_en^2", "content_en"]
    }
  }
}
```

**Test Thai analyzer:**
```json
POST /legal_docs/_analyze
{
  "field": "title_th",
  "text": "พระราชบัญญัติการพัฒนาดิจิทัล"
}
```

Should return tokens like: `["พระ", "ราช", "บัญญัติ", "การ", "พัฒนา", "ดิจิทัล"]`

### Step 4: View Document Structure

**See field mappings:**
```json
GET /legal_docs/_mapping
```

**Check Thai analyzer configuration:**
```json
GET /legal_docs/_settings
```

### Step 5: Create Visualizations (Optional)

1. Click **☰ Menu** → **Analytics** → **Visualize Library**
2. Click **Create visualization**
3. Choose visualization type:
   - **Pie Chart**: Document types distribution
   - **Bar Chart**: Documents per jurisdiction
   - **Tag Cloud**: Popular tags
   - **Line Chart**: Documents over time

**Example: Documents by Type Pie Chart**
- Visualization type: **Pie**
- Index pattern: `legal_docs`
- Bucket: **Split slices** → Aggregation: **Terms** → Field: `document_type.keyword`

### Quick Kibana Tips

| Tip | How To |
|-----|--------|
| **Filter by date range** | Click the calendar icon in top-right, select date range |
| **Save searches** | Click **Save** after creating a search query |
| **Export data** | Click **Share** → **CSV Reports** |
| **Refresh data** | Click the refresh icon (⟳) in top-right |
| **Auto-refresh** | Click the refresh dropdown → Select interval (e.g., 30s) |

---

## �🔐 Role-Based Access Control (RBAC)

### Default Roles

1. **GUEST (ROLE_GUEST)**
   - Can search and view documents
   - Read-only access

2. **RESEARCHER (ROLE_RESEARCHER)**
   - All GUEST permissions
   - Can create annotations
   - Can create document links

3. **ADMIN (ROLE_ADMIN)**
   - All RESEARCHER permissions
   - Can create/update/delete documents
   - Full system access

### Upgrade User Role

To test different roles, you need to manually update the database:

```sql
-- Connect to database
docker exec -it nexus-postgres psql -U nexus_user -d nexus_db

-- Check user's current roles
SELECT u.email, r.name 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id;

-- Add ADMIN role to a user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'admin@nexus.com' 
  AND r.name = 'ROLE_ADMIN';
```

---

## 🚨 Troubleshooting

### Frontend Not Loading

```bash
# Check frontend logs
docker-compose logs web

# Restart frontend
docker-compose restart web

# Rebuild if needed
docker-compose build web && docker-compose up -d web
```

### Backend API Errors

```bash
# Check API logs
docker-compose logs api

# Check database connection
docker-compose logs db

# Restart API
docker-compose restart api
```

### Database Connection Issues

```bash
# Check if database is ready
docker-compose logs db | grep "ready to accept connections"

# Test connection
docker exec -it nexus-postgres pg_isready -U nexus_user
```

### Elasticsearch Not Working

```bash
# Check Elasticsearch status
curl http://localhost:9200/_cluster/health?pretty

# Check if index exists (404 means index not created)
curl http://localhost:9200/legal_docs

# If 404 error, create the index
curl -X PUT "http://localhost:9200/legal_docs" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "analysis": {
        "analyzer": {
          "thai_analyzer": {
            "type": "custom",
            "tokenizer": "icu_tokenizer",
            "filter": ["lowercase"]
          }
        }
      }
    },
    "mappings": {
      "properties": {
        "id": {"type": "keyword"},
        "title_en": {"type": "text"},
        "title_th": {"type": "text", "analyzer": "thai_analyzer"},
        "content_en": {"type": "text"},
        "content_th": {"type": "text", "analyzer": "thai_analyzer"},
        "summary_en": {"type": "text"},
        "summary_th": {"type": "text", "analyzer": "thai_analyzer"},
        "document_type": {"type": "keyword"},
        "jurisdiction": {"type": "keyword"},
        "tags": {"type": "keyword"},
        "publication_date": {"type": "date"},
        "created_at": {"type": "date"}
      }
    }
  }'

# Check logs if still having issues
docker-compose logs search

# Restart Elasticsearch
docker-compose restart search
```

### Search Returns No Results

```bash
# Check if documents are indexed
curl http://localhost:9200/legal_docs/_count

# If count is 0, reindex documents from PostgreSQL
docker exec nexus-api node dist/scripts/reindex-documents.js

# Verify documents are now indexed
curl http://localhost:9200/legal_docs/_count

# Test Thai search directly in Elasticsearch
curl -X POST http://localhost:9200/legal_docs/_search \
  -H "Content-Type: application/json" \
  -d '{"query":{"multi_match":{"query":"พัฒนา","fields":["title_th","content_th"]}}}' | jq '.hits.total.value'
```

### Thai Search Not Working

```bash
# Check if Thai analyzer is applied
curl http://localhost:9200/legal_docs/_mapping | jq '.legal_docs.mappings.properties.title_th'

# Should show: "analyzer": "thai_analyzer"
# If not, you need to recreate the index with proper mapping

# Test Thai tokenization
curl -X POST http://localhost:9200/legal_docs/_analyze \
  -H "Content-Type: application/json" \
  -d '{"field":"title_th","text":"การพัฒนาดิจิทัล"}' | jq '.tokens[] | .token'

# Should return: ["การ", "พัฒนา", "ดิจิทัล"]
```

---

## 📝 Example Test Workflow

### Complete End-to-End Test

1. **Verify All Services Running**
   ```bash
   docker-compose ps
   ```

2. **Test Frontend**
   - Open http://localhost:3000 in browser
   - Verify page loads correctly

3. **Register User**
   ```bash
   curl -X POST http://localhost:3001/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test123","firstName":"Test","lastName":"User"}'
   ```

4. **Login and Get Token**
   ```bash
   TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test123"}' | \
     jq -r '.token')
   echo $TOKEN
   ```

5. **Test Authenticated Endpoint**
   ```bash
   curl -X GET http://localhost:3001/api/v1/auth/me \
     -H "Authorization: Bearer $TOKEN"
   ```

6. **Create Sample Document** (requires ADMIN role)
   - First upgrade user to ADMIN in database
   - Then create document via API

7. **Search for Document**
   ```bash
   curl -X POST http://localhost:3001/api/v1/search \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"query":"digital","language":"en","page":1,"pageSize":10}'
   ```

---

## 🎉 Success Criteria

✅ **Frontend**: Landing page loads at http://localhost:3000  
✅ **Backend**: API responds at http://localhost:3001  
✅ **Authentication**: Can register and login users  
✅ **Database**: Tables created and accessible  
✅ **Elasticsearch**: Service healthy and index created  
✅ **Docker**: All 5 containers running  

---

## 📚 Additional Resources

| Resource | URL | Purpose |
|----------|-----|---------|
| **Swagger API Docs** | http://localhost:3001/docs | Interactive API testing |
| **Kibana** | http://localhost:5601 | Elasticsearch data exploration |
| **Elasticsearch** | http://localhost:9200 | Direct ES queries |
| **Frontend** | http://localhost:3000 | Main application |
| **GitHub Repo** | https://github.com/spksupakorn/Nexus-Collaborative-Legal-Policy-Research | Source code |

## 🔗 Quick Links

- **Main README**: [README.md](./README.md) - Project overview and setup
- **Dashboard Guide**: [DASHBOARD_GUIDE.md](./DASHBOARD_GUIDE.md) - Analytics features
- **API Health Check**: http://localhost:3001/health
- **ES Cluster Health**: http://localhost:9200/_cluster/health

---

**Last Updated**: November 5, 2025  
**Project**: Nexus - Collaborative Legal & Policy Research Hub  
**Version**: 1.0.0
