# Complete Dashboard Creation Template Prompt

## 🎯 Template for Building a Professional Data Analytics Dashboard

Use this comprehensive template to generate a complete, production-ready analytics dashboard similar to the social media mentions dashboard architecture.

---

## 📋 DASHBOARD SPECIFICATION TEMPLATE

```
I want you to create a complete analytics dashboard with the following specifications:

### 🏗️ SYSTEM ARCHITECTURE

**Frontend Framework:**
- Next.js 15 with App Router
- React 19 with TypeScript (optional)
- Tailwind CSS 4 for styling
- shadcn/ui component library

**Data Management:**
- TanStack Query v5 for state management and caching
- Drizzle ORM for database operations
- PostgreSQL/MySQL database
- Node-cache or Redis for caching

**Visualization:**
- Recharts for charts and graphs
- Lucide React for icons
- Responsive design patterns

**UI/UX:**
- Modern card-based layout
- Interactive filtering system
- Cross-chart filtering capabilities
- Loading states and error handling
- Mobile-responsive design

### 🎨 DASHBOARD LAYOUT STRUCTURE

Create the following layout:

```
┌─────────────────────────────────────────────────────┐
│                    Header                           │
├─────────────────────────────────────────────────────┤
│                Filter Controls                      │
├─────────────────────────────────────────────────────┤
│              Metrics Cards Row                      │
│  [Card 1]    [Card 2]    [Card 3]    [Card 4]     │
├─────────────────────────────────────────────────────┤
│  [Summary Card]         [Main Chart - 2/3 width]   │
├─────────────────────────────────────────────────────┤
│              Chart 1 - Full width                   │
├─────────────────────────────────────────────────────┤
│              Chart 2 - Full width                   │
├─────────────────────────────────────────────────────┤
│              Data Table/List                        │
├─────────────────────────────────────────────────────┤
│                    Footer                           │
└─────────────────────────────────────────────────────┘
```

### 📊 DATA MODEL REQUIREMENTS

**Database Table:** `[YOUR_TABLE_NAME]`
**Required Columns:**
- `id` (Primary key)
- `timestamp` (DateTime)
- `[primary_metric]` (Main data field)
- `[category_field]` (For grouping/filtering)
- `[sentiment/status]` (For classification)
- `[source/platform]` (For source filtering)
- `[additional_metrics]` (Numeric fields for calculations)

**Example Schema:**
```sql
CREATE TABLE analytics_data (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  metric_value NUMERIC,
  category VARCHAR(100),
  status VARCHAR(50),
  source VARCHAR(100),
  metadata JSONB
);
```

### 🎛️ FILTER SYSTEM

**Filter Types to Implement:**
1. **Date Range Picker**
   - From/To date selection
   - Quick presets (Last 7 days, 30 days, 3 months)

2. **Category Multi-Select**
   - Checkbox list with search
   - Badge display of selected items

3. **Status/Sentiment Filter**
   - Visual chips with colors
   - Toggle on/off functionality

4. **Source/Platform Filter**
   - Icon-based selection
   - Platform-specific styling

**Cross-Filtering Behavior:**
- Clicking any chart element adds/removes filters
- All charts update simultaneously
- Filter state persists in URL parameters
- Clear all filters option

### 📈 CHART COMPONENTS TO CREATE

1. **Metrics Cards (4x)**
   ```
   - Total Count with trend indicator
   - Average Value with percentage change
   - Growth Rate with sparkline
   - Active Items with status indicator
   ```

2. **Primary Visualization**
   - Type: [Pie Chart / Bar Chart / Line Chart]
   - Interactive segments
   - Custom tooltips
   - Legend with filtering

3. **Trend Chart**
   - Type: Area/Line Chart
   - Time-series data
   - Multiple data series
   - Zoom and pan capabilities

4. **Distribution Chart**
   - Type: [Bar Chart / Donut Chart]
   - Category breakdown
   - Sortable data
   - Top N selector

5. **Data Table/List**
   - Paginated results
   - Sortable columns
   - Row click actions
   - Export functionality

### 🏗️ FILE STRUCTURE TO GENERATE

```
src/
├── app/
│   ├── dashboard/
│   │   └── page.jsx                    # Main dashboard page
│   ├── api/
│   │   ├── [endpoint-name]/
│   │   │   └── route.js               # Main data API
│   │   ├── metrics/
│   │   │   └── route.js               # Metrics API
│   │   ├── [chart-data]/
│   │   │   └── route.js               # Chart-specific APIs
│   │   └── export/
│   │       └── route.js               # Data export API
├── components/
│   ├── ui/                            # shadcn/ui components
│   ├── dashboard/
│   │   ├── charts/
│   │   │   ├── metrics-cards.jsx
│   │   │   ├── primary-chart.jsx
│   │   │   ├── trend-chart.jsx
│   │   │   ├── distribution-chart.jsx
│   │   │   └── data-table.jsx
│   │   └── filters/
│   │       └── filter-controls.jsx
│   ├── Header.jsx
│   └── LoadingSpinner.jsx
├── hooks/
│   ├── useQueries.js                  # Data fetching hooks
│   └── useFilters.js                  # Filter management
├── lib/
│   ├── db.js                          # Database connection
│   ├── schema.js                      # Drizzle schema
│   ├── utils.js                       # Utility functions
│   └── types/
│       ├── filters.js                 # Filter type definitions
│       └── api.js                     # API response types
└── providers/
    └── QueryProvider.jsx              # React Query provider
```

### 🎨 DESIGN SYSTEM

**Color Palette:**
```css
/* Primary Colors */
--primary: #2563eb (Blue)
--secondary: #64748b (Slate)
--accent: #10b981 (Green)
--warning: #f59e0b (Amber)
--danger: #ef4444 (Red)

/* Chart Colors */
--chart-1: #8884d8
--chart-2: #82ca9d  
--chart-3: #ffc658
--chart-4: #ff7300
--chart-5: #8dd1e1
```

**Typography:**
- Headers: font-bold text-2xl/3xl
- Subheaders: font-semibold text-lg
- Body: text-base
- Small text: text-sm text-gray-600

**Spacing:**
- Container padding: p-6
- Card spacing: space-y-6
- Grid gaps: gap-6
- Component margin: mb-4

### 🔧 TECHNICAL REQUIREMENTS

**State Management:**
- Use React Query for server state
- Local state with useState/useCallback
- URL state for filters
- Optimistic updates where appropriate

**Performance:**
- Implement proper loading states
- Use React.memo for expensive components
- Debounced filter updates
- Pagination for large datasets
- Client-side caching with staleTime

**Error Handling:**
- Fallback data for API failures
- User-friendly error messages
- Retry mechanisms
- Loading skeletons

**API Design Pattern:**
```javascript
// Standard API Response Format
{
  "success": true,
  "data": [...],
  "meta": {
    "filters": {...},
    "pagination": {...},
    "queryTime": "2024-01-01T12:00:00Z",
    "totalRecords": 1000,
    "dataSource": "database"
  }
}
```

### 🎯 SPECIFIC CUSTOMIZATION

**Your Dashboard Purpose:** [Describe what this dashboard is for]

**Data Source:** [Describe your data - what it tracks, where it comes from]

**Key Metrics:** [List the most important metrics to display]

**User Roles:** [Who will use this dashboard and their needs]

**Specific Charts Needed:**
1. [Chart Type] - showing [data] - with [interactions]
2. [Chart Type] - showing [data] - with [interactions]
3. [Chart Type] - showing [data] - with [interactions]

**Custom Filters:**
- [Filter Name]: [Options/behavior]
- [Filter Name]: [Options/behavior]

**Integration Requirements:**
- [External APIs to connect]
- [Authentication needs]
- [Real-time updates required?]

### 🚀 IMPLEMENTATION STEPS

1. **Setup Project Structure**
   - Initialize Next.js project
   - Install dependencies
   - Configure Tailwind and shadcn/ui

2. **Database Setup**
   - Create schema with Drizzle
   - Set up connection
   - Add sample data

3. **Core Infrastructure**
   - Query provider setup
   - Filter system implementation
   - API route structure

4. **Component Development**
   - Build reusable chart components
   - Implement filter controls
   - Create dashboard layout

5. **Integration & Testing**
   - Connect all components
   - Test cross-filtering
   - Performance optimization

6. **Enhancement & Polish**
   - Add animations
   - Error boundaries
   - Export functionality
   - Mobile optimization

Please implement this dashboard following these specifications and patterns. Create all necessary files with proper TypeScript types, comprehensive error handling, and production-ready code quality.
```

---

## 🎯 USAGE EXAMPLES

### Example 1: E-commerce Analytics Dashboard
```
"Using the template above, create an e-commerce analytics dashboard that tracks:
- Order metrics (total orders, revenue, average order value, conversion rate)
- Product performance by category
- Customer acquisition trends over time
- Geographic sales distribution
- Top-selling products table
Filter by: date range, product category, customer segment, sales channel"
```

### Example 2: Content Analytics Dashboard  
```
"Using the template above, create a content analytics dashboard that tracks:
- Content metrics (views, engagement, shares, comments)
- Content performance by type (blog, video, social)
- Audience engagement trends
- Top performing content
- Author/creator leaderboard
Filter by: date range, content type, author, platform, engagement level"
```

### Example 3: System Monitoring Dashboard
```
"Using the template above, create a system monitoring dashboard that tracks:
- System metrics (CPU, memory, disk, network usage)
- Error rates and response times
- Service health status
- Alert frequency trends
- Performance benchmarks table  
Filter by: time range, service name, severity level, server location"
```

This template provides a complete blueprint for building professional, interactive dashboards with modern web technologies!