# Popular Posts Sorting Flow Diagram

## Component Hierarchy & Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   SocialMediaDashboard                          │
│                    (dashboard/page.jsx)                         │
│                                                                 │
│  State:                                                         │
│  • filters: { sentiments, sources, dateRange }                 │
│  • postsSortBy: "reach" | "interactions" | "date"             │
│                                                                 │
│  Handlers:                                                      │
│  • handlePostsSortChange(newSort)                              │
│    └─> setPostsSortBy(newSort)                                │
│    └─> Triggers React Query refetch                           │
│                                                                 │
│  React Query:                                                   │
│  • queryKey: ["social-media", "popular-posts", filters, sort] │
│  • queryFn: fetchPopularPosts(filters, postsSortBy)           │
│                                                                 │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ Props:
                   │ • data={popularPostsData?.data}
                   │ • currentSort={postsSortBy}
                   │ • onSortChange={handlePostsSortChange}
                   │ • isLoading={isLoadingPopular}
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MostPopularPosts                             │
│         (components/dashboard/.../most-popular-posts.jsx)       │
│                                                                 │
│  Props Received:                                                │
│  • data: Array of post objects (pre-sorted)                    │
│  • currentSort: Current sort method                            │
│  • onSortChange: Callback to trigger new query                 │
│                                                                 │
│  UI Elements:                                                   │
│  ┌───────────┐ ┌──────────────┐ ┌──────────┐                 │
│  │ By Reach  │ │ By Engagement│ │ By Date  │                 │
│  └─────┬─────┘ └──────┬───────┘ └────┬─────┘                 │
│        │              │               │                        │
│        └──────────────┴───────────────┘                        │
│                       │                                         │
│              onClick: handleSortChange(sortType)                │
│                       │                                         │
│                       ▼                                         │
│              onSortChange(sortType)                             │
│              (calls parent's handler)                           │
│                                                                 │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ HTTP Request:
                   │ GET /api/social-media/popular-posts
                   │     ?sort={reach|interactions|date}
                   │     &sentiments=...
                   │     &sources=...
                   │     &date_from=...
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API Route Handler                             │
│          (api/social-media/popular-posts/route.js)              │
│                                                                 │
│  1. Parse Query Parameters:                                     │
│     • sortBy = searchParams.get('sort') || 'reach'             │
│     • filters = { sentiments, sources, dateRange }             │
│                                                                 │
│  2. Build SQL WHERE Conditions:                                 │
│     • Date range filters                                        │
│     • Sentiment filters                                         │
│     • Source/platform filters                                   │
│                                                                 │
│  3. Determine ORDER BY Clause:                                  │
│     ┌─────────────────────────────────────────────┐            │
│     │ switch (sortBy) {                           │            │
│     │   case 'reach':                             │            │
│     │     → ORDER BY reach DESC                   │            │
│     │   case 'interactions':                      │            │
│     │     → ORDER BY (likes+shares+comments) DESC │            │
│     │   case 'date':                              │            │
│     │     → ORDER BY inserttime DESC              │            │
│     │ }                                           │            │
│     └─────────────────────────────────────────────┘            │
│                                                                 │
│  4. Execute Query via Drizzle ORM                               │
│                                                                 │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ SQL Query
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PostgreSQL Database                        │
│                   (mentions_classify_public table)               │
│                                                                 │
│  Query Execution:                                               │
│  • Filter by WHERE conditions                                   │
│  • Sort by specified column/expression                          │
│  • Limit results (default: 20)                                  │
│  • Use indexes for optimization                                 │
│                                                                 │
│  Returns:                                                       │
│  • Sorted array of post records                                 │
│  • Fields: id, content, author, reach, likes, shares, etc.     │
│                                                                 │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ Response Data
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   JSON Response                                 │
│                                                                 │
│  {                                                              │
│    success: true,                                               │
│    data: [                                                      │
│      {                                                          │
│        id: "...",                                               │
│        content: "...",                                          │
│        reach: 50000,                                            │
│        likecount: 500,                                          │
│        sharecount: 100,                                         │
│        commentcount: 50,                                        │
│        totalInteractions: 650,                                  │
│        ...                                                      │
│      },                                                         │
│      ...                                                        │
│    ],                                                           │
│    meta: {                                                      │
│      sortBy: "reach",                                           │
│      dataSource: "database",                                    │
│      totalPosts: 20                                             │
│    }                                                            │
│  }                                                              │
│                                                                 │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ React Query caches response
                   │ Component re-renders with sorted data
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Display Sorted Posts                         │
│                                                                 │
│  • Posts displayed in order received from API                   │
│  • No client-side sorting needed                                │
│  • Active button highlighted based on currentSort               │
│  • Loading state shown during fetch                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## State Change Sequence

### When User Clicks "By Engagement":

```
1. User clicks "By Engagement" button
   ↓
2. MostPopularPosts: handleSortChange("interactions")
   ↓
3. Calls: onSortChange("interactions")
   ↓
4. Dashboard: handlePostsSortChange("interactions")
   ↓
5. Updates state: setPostsSortBy("interactions")
   ↓
6. React Query detects query key change:
   OLD: ["social-media", "popular-posts", filters, "reach"]
   NEW: ["social-media", "popular-posts", filters, "interactions"]
   ↓
7. React Query triggers new fetch
   ↓
8. Calls: fetchPopularPosts(filters, "interactions")
   ↓
9. HTTP Request: /api/social-media/popular-posts?sort=interactions&...
   ↓
10. API processes request with ORDER BY (likes+shares+comments) DESC
    ↓
11. Database returns sorted results
    ↓
12. API sends JSON response
    ↓
13. React Query updates cache
    ↓
14. Component re-renders with new data
    ↓
15. "By Engagement" button shows as active (variant="default")
```

## Query Key Strategy

React Query uses the query key for caching:

```javascript
// Each sort method has its own cache entry
["social-media", "popular-posts", {...filters}, "reach"]        // Cache 1
["social-media", "popular-posts", {...filters}, "interactions"] // Cache 2  
["social-media", "popular-posts", {...filters}, "date"]         // Cache 3

// If filters change, all three caches invalidate
["social-media", "popular-posts", {...newFilters}, "reach"]     // New Cache 1
```

**Benefits:**
- Instant display when switching between cached sorts
- Automatic refetch when filters change
- Stale data handled by React Query (30s stale time)

## Performance Considerations

### Database-Level Sorting:
✅ Efficient indexing on columns (reach, inserttime)
✅ Reduced data transfer (only top N records)
✅ Query optimization by PostgreSQL
✅ Handles large datasets better

### Client-Side Caching:
✅ React Query caches each sort variant
✅ No re-fetch if data is fresh (<30s)
✅ Background refetch for data freshness
✅ Optimistic UI updates

### Network Optimization:
✅ Only fetch when sort changes
✅ Parallel requests possible (React Query)
✅ Automatic retry on failure
✅ Loading states prevent duplicate requests

---

**Last Updated**: October 13, 2025
