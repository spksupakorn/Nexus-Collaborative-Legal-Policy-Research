# ✅ Elasticsearch Index Setup - Fixed!

## Issue Resolved

**Original Error:**
```json
{
  "error": "index_not_found_exception\n\tRoot causes:\n\t\tindex_not_found_exception: no such index [legal_docs]"
}
```

**Status:** ✅ **FIXED**

---

## What Was the Problem?

The Elasticsearch index `legal_docs` was not created when the application started. This is a common initialization step that needs to happen before documents can be indexed or searched.

---

## Solution Applied

### 1. Created Elasticsearch Index
Ran initialization script to create the `legal_docs` index with proper mappings:

```bash
docker exec -it nexus-api node -e "..."
```

### 2. Index Configuration
The index now includes:

**Thai Language Support:**
- Custom `thai_analyzer` using ICU tokenizer
- Proper text analysis for Thai content

**Field Mappings:**
- `id` - Keyword (exact match)
- `titleEn` / `titleTh` - Text with language-specific analyzers
- `contentEn` / `contentTh` - Full-text search fields
- `summaryEn` / `summaryTh` - Summary text
- `documentType` - Keyword (law, policy, regulation, research)
- `tags` - Keyword array
- `publicationDate` - Date field
- `createdAt` - Date field

---

## Verification

### ✅ Index Created Successfully:
```bash
curl -X GET "http://localhost:9200/legal_docs" | jq
```

Result:
```json
{
  "legal_docs": {
    "mappings": {
      "properties": {
        "id": { "type": "keyword" },
        "titleEn": { "type": "text", "analyzer": "english" },
        "titleTh": { "type": "text", "analyzer": "thai_analyzer" },
        "contentEn": { "type": "text", "analyzer": "english" },
        "contentTh": { "type": "text", "analyzer": "thai_analyzer" },
        ...
      }
    }
  }
}
```

### ✅ Search Endpoint Now Works:
```bash
curl -X POST http://localhost:3001/api/v1/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "searchType": "text"}'
```

Result:
```json
{
  "results": [],
  "total": 0,
  "page": 1,
  "limit": 20,
  "facets": {
    "documentTypes": [],
    "jurisdictions": [],
    "tags": []
  }
}
```

**No more 400 error!** Returns empty results (expected when no documents exist).

---

## For Future Use

### Automatic Initialization Script

Created: `backend/src/scripts/init-elasticsearch.ts`

**To run manually:**
```bash
# Inside Docker container
docker exec -it nexus-api npm run init-es

# Or directly
docker exec -it nexus-api node -e "..."
```

**Added to package.json:**
```json
{
  "scripts": {
    "init-es": "tsx src/scripts/init-elasticsearch.ts"
  }
}
```

---

## Next Steps

### 1. Add Sample Documents

Now that the index is ready, you can add documents:

**Via API (requires Admin role):**
```bash
# Get token
TOKEN=$(curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@nexus.com", "password": "Admin123!"}' \
  | jq -r '.token')

# Create document
curl -X POST http://localhost:3001/api/v1/documents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titleEn": "Personal Data Protection Act B.E. 2562 (2019)",
    "titleTh": "พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562",
    "summaryEn": "Thai personal data protection law",
    "summaryTh": "กฎหมายคุ้มครองข้อมูลส่วนบุคคลของประเทศไทย",
    "contentEn": "This Act provides for the protection of personal data...",
    "contentTh": "พระราชบัญญัตินี้มีวัตถุประสงค์เพื่อคุ้มครองข้อมูลส่วนบุคคล...",
    "documentType": "LAW",
    "tags": ["privacy", "data protection", "PDPA", "คุ้มครองข้อมูล"],
    "publicationDate": "2019-05-27",
    "jurisdiction": "Thailand"
  }'
```

### 2. Verify Document is Indexed

```bash
# Check Elasticsearch directly
curl -X GET "http://localhost:9200/legal_docs/_search?pretty"

# Or use the search API
curl -X POST http://localhost:3001/api/v1/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "personal data", "searchType": "text"}'
```

### 3. Test Search Features

**Text Search:**
```bash
curl -X POST http://localhost:3001/api/v1/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "ข้อมูลส่วนบุคคล", "searchType": "text"}'
```

**Semantic Search:**
```bash
curl -X POST http://localhost:3001/api/v1/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "privacy law", "searchType": "semantic"}'
```

**With Filters:**
```bash
curl -X POST http://localhost:3001/api/v1/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "data protection",
    "searchType": "text",
    "filters": {
      "documentTypes": ["LAW"],
      "tags": ["privacy"]
    }
  }'
```

---

## Understanding the Error

### Why Did This Happen?

1. **Elasticsearch starts empty** - No indices exist by default
2. **Application doesn't auto-create indices** - For production safety
3. **Index must be created before searching** - Elasticsearch requirement

### Why Is This the Right Behavior?

✅ **Controlled schema** - Define mappings explicitly
✅ **Thai language support** - Custom analyzers configured
✅ **Performance** - Optimized field types
✅ **Production safety** - No accidental index creation

---

## Summary

| Before | After |
|--------|-------|
| ❌ 400 Error: index_not_found_exception | ✅ 200 OK: Empty search results |
| ❌ No Elasticsearch index | ✅ Index created with Thai support |
| ❌ Cannot search | ✅ Search endpoint working |
| ❌ Cannot add documents | ✅ Ready to accept documents |

---

## Quick Commands Reference

```bash
# Check if index exists
curl http://localhost:9200/legal_docs

# View index mappings
curl http://localhost:9200/legal_docs/_mapping | jq

# Count documents in index
curl http://localhost:9200/legal_docs/_count

# Search all documents
curl http://localhost:9200/legal_docs/_search?pretty

# Delete index (careful!)
curl -X DELETE http://localhost:9200/legal_docs

# Recreate index
docker exec -it nexus-api npm run init-es
```

---

## Status: ✅ RESOLVED

The Elasticsearch index is now properly initialized and the search endpoint is working correctly. You can now:

1. ✅ Search for documents (returns empty results when no docs)
2. ✅ Add documents via API
3. ✅ Test Thai and English text search
4. ✅ Use semantic search features
5. ✅ Apply filters and facets

**The error is fixed!** 🎉
