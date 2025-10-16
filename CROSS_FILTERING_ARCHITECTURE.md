# Cross-Filtering Architecture Diagram

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTIONS                            │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  Click Chart     │  │  Click Author    │  │  Click Sentiment │ │
│  │  Elements        │  │  Row in Table    │  │  Badge in Table  │ │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘ │
│           │                     │                     │            │
│           └─────────────────────┴─────────────────────┘            │
│                                 │                                   │
└─────────────────────────────────┼───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DASHBOARD COMPONENT                             │
│                      (dashboard/page.jsx)                            │
│                                                                      │
│  handleChartClick(clickDataOrType, value) {                         │
│    ┌──────────────────────────────────────────────────┐            │
│    │ Determine Click Type:                            │            │
│    │  • String: "sentiment" | "source" | "author"     │            │
│    │  • Object: { type, value, sentiment?, author? }  │            │
│    └──────────────────────────────────────────────────┘            │
│                          │                                           │
│                          ▼                                           │
│    ┌──────────────────────────────────────────────────┐            │
│    │ Update Filters State:                            │            │
│    │                                                   │            │
│    │ Case "author":                                   │            │
│    │   Toggle author in filters.authors[]            │            │
│    │                                                   │            │
│    │ Case { type: "author", sentiment }:              │            │
│    │   Toggle author in filters.authors[]            │            │
│    │   Toggle sentiment in filters.sentiments[]      │            │
│    └──────────────────────────────────────────────────┘            │
│                          │                                           │
│                          ▼                                           │
│              setFilters(newFilters)                                  │
│                          │                                           │
└──────────────────────────┼──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FILTER STATE UPDATE                               │
│                                                                      │
│  OLD:                           NEW:                                 │
│  {                              {                                    │
│    sentiments: [],                sentiments: ["positive"],          │
│    sources: ["facebook"],         sources: ["facebook"],             │
│    authors: [],          →        authors: ["John Doe"],             │
│    topics: [],                    topics: [],                        │
│    dateRange: {...}               dateRange: {...}                   │
│  }                              }                                    │
│                                                                      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    REACT QUERY DETECTION                             │
│                                                                      │
│  Query Keys Change:                                                  │
│                                                                      │
│  ["social-media", "metrics", {...oldFilters}]                       │
│  ["social-media", "metrics", {...newFilters}]    ← DIFFERENT!       │
│                                                                      │
│  ["social-media", "popular-posts", {...oldFilters}, "reach"]        │
│  ["social-media", "popular-posts", {...newFilters}, "reach"]        │
│                                                                      │
│  ["social-media", "top-authors", {...oldFilters}, "totalPosts"]     │
│  ["social-media", "top-authors", {...newFilters}, "totalPosts"]     │
│                                                                      │
│  ... (all query keys with filters)                                  │
│                                                                      │
│  ⚡ React Query triggers refetch for ALL changed queries             │
│                                                                      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Metrics API   │  │ Timeline API  │  │ Top Authors   │
│               │  │               │  │ API           │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API REQUEST LAYER                             │
│                                                                      │
│  GET /api/social-media/metrics?                                     │
│      sentiments=positive&                                            │
│      sources=facebook&                                               │
│      authors=John Doe         ← NEW PARAMETER                        │
│                                                                      │
│  GET /api/social-media/sentiment-timeline?                          │
│      sentiments=positive&                                            │
│      sources=facebook&                                               │
│      authors=John Doe         ← NEW PARAMETER                        │
│                                                                      │
│  ... (all API endpoints)                                             │
│                                                                      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     API ROUTE HANDLER                                │
│                                                                      │
│  1. Parse URL Parameters:                                            │
│     const authorsParam = searchParams.get('authors');               │
│                                                                      │
│  2. Build Filters Object:                                            │
│     const filters = {                                                │
│       sentiments: [...],                                             │
│       sources: [...],                                                │
│       authors: authorsParam ? authorsParam.split(',') : [],         │
│       dateRange: {...}                                               │
│     }                                                                │
│                                                                      │
│  3. Build WHERE Conditions:                                          │
│     const conditions = buildWhereConditions(filters);               │
│                                                                      │
│     // Includes:                                                     │
│     if (filters.authors.length > 0) {                               │
│       conditions.push(                                               │
│         inArray(schema.author, filters.authors)                     │
│       );                                                             │
│     }                                                                │
│                                                                      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE QUERY                                  │
│                                                                      │
│  SELECT                                                              │
│    COUNT(*) as total_posts,                                          │
│    SUM(reach) as total_reach,                                        │
│    SUM(likecount + sharecount + commentcount) as total_interactions │
│  FROM mentions_classify_public                                       │
│  WHERE                                                               │
│    autosentiment IS NOT NULL                                         │
│    AND autosentiment IN ('positive')          ← sentiment filter     │
│    AND type LIKE '%facebook%'                 ← source filter        │
│    AND author IN ('John Doe')                 ← 🆕 AUTHOR FILTER     │
│    AND inserttime >= '...'                    ← date filter          │
│    AND inserttime <= '...'                    ← date filter          │
│                                                                      │
│  📊 Returns: Filtered, aggregated results                            │
│                                                                      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       RESPONSE FLOW BACK                             │
│                                                                      │
│  Database → API Route → React Query → Components                    │
│                                                                      │
│  {                                                                   │
│    success: true,                                                    │
│    data: {                                                           │
│      totalPosts: 42,          ← Only John Doe's positive posts      │
│      totalReach: 125000,                                             │
│      totalInteractions: 3500                                         │
│    },                                                                │
│    meta: {                                                           │
│      filters: {                                                      │
│        authors: ["John Doe"],                                        │
│        sentiments: ["positive"],                                     │
│        sources: ["facebook"]                                         │
│      }                                                               │
│    }                                                                 │
│  }                                                                   │
│                                                                      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┬──────────────────┐
        │                  │                  │                  │
        ▼                  ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ MetricsCards │  │ Timeline     │  │ Top Authors  │  │ Popular      │
│              │  │ Chart        │  │ Table        │  │ Posts        │
│ Updates with │  │              │  │              │  │              │
│ filtered     │  │ Shows only   │  │ Highlights   │  │ Shows only   │
│ totals       │  │ John's data  │  │ John's row   │  │ John's posts │
│              │  │              │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

## Interactive Components Matrix

Shows which components interact with filtering:

```
┌────────────────────────┬───────┬────────┬─────────┬────────┬─────────┐
│ Component              │ Click │ Filter │ Updates │ Shows  │ Exports │
│                        │ to    │ By     │ When    │ Active │ Handler │
│                        │ Filter│ Author │ Filtered│ State  │         │
├────────────────────────┼───────┼────────┼─────────┼────────┼─────────┤
│ MetricsCards           │   -   │   ✅   │    ✅   │   -    │    -    │
├────────────────────────┼───────┼────────┼─────────┼────────┼─────────┤
│ SentimentBySourceChart │   ✅  │   ✅   │    ✅   │   ✅   │    ✅   │
├────────────────────────┼───────┼────────┼─────────┼────────┼─────────┤
│ SentimentAreaChart     │   ✅  │   ✅   │    ✅   │   ✅   │    ✅   │
├────────────────────────┼───────┼────────┼─────────┼────────┼─────────┤
│ TopAuthorsTable        │  🆕✅  │   ✅   │    ✅   │  🆕✅   │   🆕✅  │
├────────────────────────┼───────┼────────┼─────────┼────────┼─────────┤
│ MostPopularPosts       │   ✅  │   ✅   │    ✅   │   -    │    ✅   │
├────────────────────────┼───────┼────────┼─────────┼────────┼─────────┤
│ EngagementRateChart    │   -   │   ✅   │    ✅   │   -    │    -    │
├────────────────────────┼───────┼────────┼─────────┼────────┼─────────┤
│ SentimentByTopicsChart │   ✅  │   ✅   │    ✅   │   ✅   │    ✅   │
├────────────────────────┼───────┼────────┼─────────┼────────┼─────────┤
│ FilterControls         │   ✅  │  🆕✅   │    ✅   │  🆕✅   │    -    │
└────────────────────────┴───────┴────────┴─────────┴────────┴─────────┘

Legend:
  ✅  = Supported
  🆕✅ = Newly Added
  -   = Not Applicable
```

## Click Event Flow

### Scenario: User clicks on "John Doe" row

```
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: User Interaction                                     │
│                                                               │
│  User clicks on table row:                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ # │ Author    │ Followers │ Positive │ Negative │ ... │ │
│  ├───┼───────────┼───────────┼──────────┼──────────┼─────┤ │
│  │ 1 │ John Doe  │ 45.2K     │   125    │    32    │ ... │ │
│  │   │ [positive]│           │          │          │     │ │
│  └────────────────────────────────────────────────────────┘ │
│         ▲ CLICK HERE                                         │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 2: Row Click Handler                                    │
│                                                               │
│  handleAuthorRowClick("John Doe")                            │
│    │                                                          │
│    └─→ onAuthorClick("author", "John Doe")                   │
│          │                                                    │
│          └─→ Propagates to parent                            │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 3: Dashboard Handler                                    │
│                                                               │
│  handleChartClick("author", "John Doe")                      │
│    │                                                          │
│    ├─→ Check if already filtered                             │
│    │   const isFiltered = filters.authors.includes("John")   │
│    │                                                          │
│    ├─→ If filtered: REMOVE                                   │
│    │   authors = authors.filter(a => a !== "John Doe")       │
│    │                                                          │
│    └─→ If not filtered: ADD                                  │
│        authors = [...authors, "John Doe"]                    │
│                                                               │
│  setFilters({ ...filters, authors })                         │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 4: React Query Refetch                                  │
│                                                               │
│  All queries with changed keys refetch simultaneously:       │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ /api/social-media/metrics?authors=John Doe          │    │
│  │ /api/social-media/sentiment-timeline?authors=John   │    │
│  │ /api/social-media/popular-posts?authors=John Doe    │    │
│  │ /api/social-media/top-authors?authors=John Doe      │    │
│  │ ... etc                                              │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 5: Visual Updates                                       │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Filter Controls:                                     │    │
│  │ [😊 Positive] [📘 Facebook] [👤 John Doe] [X Clear] │    │
│  │                              ▲ NEW BADGE            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Top Authors Table:                                   │    │
│  │ 1 | John Doe [Filtered] | 45.2K | ...              │    │
│  │   └─ Highlighted in indigo                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Metrics Cards:                                       │    │
│  │ Total Posts: 42 (only John's posts)                 │    │
│  │ Total Reach: 125K (only John's reach)               │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

## Filter Combination Examples

### Example 1: Author Only
```
User clicks: John Doe row

Filters: { authors: ["John Doe"] }

SQL: WHERE author IN ('John Doe')

Result: Shows all John Doe's posts across all platforms and sentiments
```

### Example 2: Author + Sentiment
```
User clicks: Positive badge on John Doe row

Filters: { 
  authors: ["John Doe"],
  sentiments: ["positive"]
}

SQL: WHERE author IN ('John Doe') AND autosentiment IN ('positive')

Result: Shows only John Doe's positive posts
```

### Example 3: Multi-dimensional Filter
```
User actions:
1. Clicks Facebook chart → sources: ["facebook"]
2. Clicks Positive sentiment → sentiments: ["positive"]
3. Clicks John Doe row → authors: ["John Doe"]
4. Sets date range → dateRange: {from: "2024-01-01", to: "2024-12-31"}

Filters: { 
  sources: ["facebook"],
  sentiments: ["positive"],
  authors: ["John Doe"],
  dateRange: {from: "2024-01-01", to: "2024-12-31"}
}

SQL: 
WHERE type LIKE '%facebook%'
  AND autosentiment IN ('positive')
  AND author IN ('John Doe')
  AND inserttime >= '2024-01-01T00:00:00.000Z'
  AND inserttime <= '2024-12-31T23:59:59.999Z'

Result: Shows only John Doe's positive Facebook posts from 2024
```

---

**Architecture**: Event-Driven, State-Synchronized  
**Performance**: Database-level filtering with React Query caching  
**User Experience**: Instant feedback, visual indicators, easy removal
