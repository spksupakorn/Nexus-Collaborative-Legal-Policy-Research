# 📊 Nexus Dashboard, Knowledge Graph & Trend Analysis

## ✨ New Features

Your Nexus platform now includes **advanced analytics and visualization features**:

1. **Interactive Dashboard** - Comprehensive statistics and overview
2. **Knowledge Graph** - Visual representation of document relationships
3. **Trend Analysis** - Charts and insights on document and search patterns

---

## 🎯 Dashboard Page (`/dashboard`)

### Overview Tab

**Statistics Cards:**
- 📄 **Total Documents** - Count of all documents in the system
- 👥 **Total Users** - Number of registered users
- 🔍 **Total Searches** - Search activity metrics

**Recent Documents:**
- List of the 5 most recently added documents
- Quick links to view each document
- Shows document type and creation date

**Quick Stats:**
- Category distribution breakdown
- Popular tags with usage counts

### Features:
- Bilingual interface (Thai/English)
- Protected route (requires authentication)
- Real-time data from backend API
- Responsive design for mobile and desktop

---

## 🕸️ Knowledge Graph Visualization

### Interactive Network Graph

**Visual Features:**
- **Color-coded nodes** by document type:
  - 🔵 Blue: Law (กฎหมาย)
  - 🟢 Green: Policy (นโยบาย)
  - 🟠 Orange: Regulation (ระเบียบ)
  - 🟣 Purple: Research (งานวิจัย)

- **Animated edges** showing relationships:
  - Arrows indicate link direction
  - Labels show relationship type (cites, references, etc.)

**Interactions:**
- **Click nodes** to see detailed information
- **Drag nodes** to rearrange the graph
- **Zoom** in/out with mouse wheel
- **Pan** by dragging the background
- Built-in controls for navigation

**Legend:**
- Top-left panel shows color coding
- Top-right panel displays selected node details

### Technology:
- Powered by **ReactFlow** library
- Circular layout algorithm for optimal visualization
- Dynamic positioning based on number of nodes

---

## 📈 Trend Analysis

### Available Charts:

#### 1. Document Creation Trends (Line Chart)
- Shows document creation over the last 7 months
- Monthly aggregation
- Bilingual axis labels
- Hover for detailed counts

#### 2. Search Trends (Bar Chart)
- Search activity by month
- Visual comparison of search patterns
- Color-coded bars

#### 3. Category Distribution (Pie Chart)
- Percentage breakdown by document type
- Interactive legend
- Actual counts displayed below chart

#### 4. Popular Tags (Progress Bars)
- Top 10 most used tags
- Relative frequency visualization
- Actual usage counts

### Features:
- **Responsive charts** - Adapts to screen size
- **Interactive tooltips** - Hover for details
- **Color-coded** - Consistent with graph colors
- **Bilingual labels** - Thai and English

### Technology:
- Powered by **Recharts** library
- Responsive containers
- Customizable themes

---

## 🔧 Technical Implementation

### Frontend Components

#### `KnowledgeGraph.tsx`
```typescript
Location: frontend/src/components/KnowledgeGraph.tsx

Features:
- ReactFlow integration
- Dynamic node positioning
- Click handlers for node selection
- Customizable node styles
- Edge animations
```

#### `TrendAnalysis.tsx`
```typescript
Location: frontend/src/components/TrendAnalysis.tsx

Charts:
- LineChart for document trends
- BarChart for search trends
- PieChart for category distribution
- Progress bars for popular tags
```

#### `dashboard/page.tsx`
```typescript
Location: frontend/src/app/dashboard/page.tsx

Features:
- Tab navigation (Overview, Graph, Trends)
- API integration
- Protected route with auth check
- Loading states and error handling
- Mock data fallback for demo
```

### Backend Services

#### `DashboardService.ts`
```typescript
Location: backend/src/services/DashboardService.ts

Methods:
- getDashboardStats() - Main statistics
- getDocumentTrends() - Time-series data
- getCategoryDistribution() - Document type breakdown
- getPopularTags() - Tag usage analysis
- getKnowledgeGraphData() - Graph nodes and edges
```

#### `DashboardController.ts`
```typescript
Location: backend/src/controllers/DashboardController.ts

Endpoint:
GET /api/v1/dashboard
- Protected by authentication
- Returns comprehensive stats object
```

### API Response Structure:
```json
{
  "totalDocuments": 156,
  "totalUsers": 23,
  "totalSearches": 1847,
  "recentDocuments": [...],
  "documentTrends": [...],
  "searchTrends": [...],
  "categoryDistribution": [...],
  "popularTags": [...],
  "knowledgeGraph": {
    "nodes": [...],
    "links": [...]
  }
}
```

---

## 🚀 Usage Guide

### Accessing the Dashboard

1. **Login** to your account at http://localhost:3000/login
2. Navigate to http://localhost:3000/dashboard
3. Or click **"แดชบอร์ด / Dashboard"** in the navigation menu

### Exploring Features

**Overview Tab:**
- View quick statistics at the top
- Browse recent documents
- See category breakdown and popular tags

**Knowledge Graph Tab:**
- Click on any node to see document details
- Drag nodes to reorganize the layout
- Use mouse wheel to zoom in/out
- Use controls in bottom-left for navigation
- Read legend in top-left for color meanings

**Trend Analysis Tab:**
- Scroll through different chart types
- Hover over data points for details
- View trends over time
- Analyze popular topics

### Testing with API

#### Get Dashboard Data:
```bash
# Get authentication token first
TOKEN=$(curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@nexus.com", "password": "Demo123!"}' \
  | jq -r '.token')

# Fetch dashboard stats
curl -X GET http://localhost:3001/api/v1/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  | jq
```

---

## 📊 Data Requirements

### For Full Functionality:

**Documents:**
- Need at least 10-20 documents for meaningful graphs
- Documents should have links between them
- Tags help with trend analysis

**Document Links:**
- Create relationships using the API
- Link types: CITES, REFERENCES, AMENDS, etc.
- Links appear as edges in knowledge graph

**Creating Sample Data:**

```bash
# Create a document
curl -X POST http://localhost:3001/api/v1/documents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titleEn": "Personal Data Protection Act",
    "titleTh": "พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล",
    "documentType": "LAW",
    "tags": ["privacy", "data protection", "PDPA"]
  }'

# Create a link between documents
curl -X POST http://localhost:3001/api/v1/documents/DOC_ID_1/links \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetDocumentId": "DOC_ID_2",
    "linkType": "REFERENCES"
  }'
```

---

## 🎨 Customization

### Color Scheme:
The dashboard uses consistent colors throughout:
- **Blue (#3B82F6)** - Law documents
- **Green (#10B981)** - Policy documents
- **Orange (#F59E0B)** - Regulation documents
- **Purple (#8B5CF6)** - Research documents

### Graph Layout:
The knowledge graph uses a circular layout by default. To modify:
1. Edit `KnowledgeGraph.tsx`
2. Update node position calculations
3. Consider force-directed or hierarchical layouts

### Charts:
Customize trend charts in `TrendAnalysis.tsx`:
- Change colors in COLORS array
- Adjust chart dimensions (height property)
- Modify tooltip formatting
- Add additional chart types

---

## 🔐 Permissions

**Dashboard Access:**
- ✅ All authenticated users can view
- ✅ See all public statistics
- ✅ View knowledge graph
- ✅ Analyze trends

**Data Creation:**
- ⚠️ Document creation: Admin only
- ⚠️ Link creation: Researcher and Admin
- ⚠️ Tag management: Via document metadata

---

## 🐛 Troubleshooting

### Dashboard shows "No data"
**Solution:** Create some documents first
```bash
# Check if documents exist
curl -X GET http://localhost:3001/api/v1/documents \
  -H "Authorization: Bearer $TOKEN"
```

### Knowledge graph is empty
**Solution:** Create links between documents
```bash
# List documents to get IDs
curl -X GET http://localhost:3001/api/v1/documents \
  -H "Authorization: Bearer $TOKEN"

# Create links
curl -X POST http://localhost:3001/api/v1/documents/{id}/links \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"targetDocumentId": "...", "linkType": "CITES"}'
```

### Charts not displaying
**Solution:** Ensure Recharts is installed
```bash
cd frontend
npm install recharts
```

### Graph controls not working
**Solution:** Verify ReactFlow installation
```bash
cd frontend
npm install reactflow
```

### API returns 500 error
**Solution:** Check backend logs
```bash
docker logs nexus-api
```

---

## 📱 Responsive Design

The dashboard is fully responsive:
- **Desktop** - Full width with multi-column layouts
- **Tablet** - Adaptive grid (2 columns → 1 column)
- **Mobile** - Single column, touch-optimized

---

## 🌐 Bilingual Support

All dashboard features include Thai/English labels:
- Navigation menu
- Tab labels
- Chart axes
- Statistics cards
- Error messages
- Tooltips

---

## 📈 Performance

**Optimizations:**
- ✅ Dynamic imports for ReactFlow (SSR-safe)
- ✅ Pagination for large datasets
- ✅ Lazy loading of chart libraries
- ✅ Debounced interactions
- ✅ Efficient data queries in backend

**Limits:**
- Knowledge graph shows up to 20 nodes
- Recent documents limited to 5 items
- Popular tags capped at 10
- Trend data: last 7 months

---

## 🚀 Next Steps

### Enhancements:
1. **Filter options** - Filter graph by document type
2. **Time range selector** - Custom date ranges for trends
3. **Export functionality** - Download charts as images
4. **Real-time updates** - WebSocket for live data
5. **Advanced graph layouts** - Force-directed, hierarchical
6. **Comparison tools** - Compare time periods
7. **Predictive analytics** - ML-based forecasting

### Additional Features:
- User activity heatmap
- Document similarity matrix
- Citation network analysis
- Topic modeling visualization
- Sentiment analysis charts
- Collaboration networks

---

## 📚 Resources

**Libraries Used:**
- [ReactFlow](https://reactflow.dev/) - Interactive graph visualization
- [Recharts](https://recharts.org/) - React charting library
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling

**Documentation:**
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - API testing examples
- [PAGES_COMPLETE.md](./PAGES_COMPLETE.md) - Page structure
- [README.md](./README.md) - Project overview

---

## ✅ Success Checklist

- [x] Dashboard page created at `/dashboard`
- [x] Knowledge graph visualization working
- [x] Trend analysis charts displaying
- [x] Backend API endpoint `/api/v1/dashboard`
- [x] Navigation links updated
- [x] Authentication protection
- [x] Bilingual interface
- [x] Responsive design
- [x] Mock data for demo
- [x] Error handling

---

## 🎉 You're All Set!

Your Nexus platform now features:
- ✨ **Interactive Dashboard** with real-time statistics
- 🕸️ **Knowledge Graph** for visualizing document relationships
- 📊 **Trend Analysis** for data-driven insights

**Access it now:**
1. Login: http://localhost:3000/login
2. Dashboard: http://localhost:3000/dashboard

**Enjoy your enhanced Nexus platform!** 🚀
