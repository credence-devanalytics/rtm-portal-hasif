# MyTV Viewership API - Refactored to Match Unifi Pattern

## Changes Made

### ✅ Refactored API Route (`src/app/api/mytv-viewership/route.ts`)

**Removed:**
- ❌ Mock data fallback logic (complex try-catch with mock data generation)
- ❌ SQL template string queries
- ❌ Manual WHERE clause building with `sql` template
- ❌ Multiple separate database calls for aggregations

**Added:**
- ✅ Clean Drizzle ORM queries (same pattern as Unifi API)
- ✅ Using `eq`, `and`, `inArray` helpers for type-safe queries
- ✅ In-memory aggregation functions (like Unifi)
- ✅ Better error handling with detailed console logging
- ✅ Cleaner code structure

### Pattern Comparison

#### ❌ Old Pattern (SQL Template Strings)
```typescript
const whereClause = conditions.length > 0 
  ? sql`WHERE ${sql.join(conditions, sql` AND `)}` 
  : sql``;

const dataResult = await db.execute(
  sql`SELECT * FROM mytv_viewership ${whereClause}`
);
```

#### ✅ New Pattern (Drizzle ORM - Like Unifi)
```typescript
const whereConditions = [];
if (channel && channel !== 'all') {
  whereConditions.push(inArray(mytvViewership.channel, channels));
}

let query = db.select().from(mytvViewership);
if (whereConditions.length > 0) {
  query = query.where(and(...whereConditions));
}
const allData = await query;
```

### Updated Schema (`drizzle/schema.ts`)

Added missing fields to match the actual database table:

```typescript
export const mytvViewership = pgTable("mytv_viewership", {
  id: serial().primaryKey().notNull(),
  region: varchar({ length: 100 }),
  metric: varchar({ length: 100 }),
  channel: varchar({ length: 50 }),
  month: varchar({ length: 20 }),
  year: integer(),
  viewers: bigint({ mode: "number" }),  // Changed from integer to bigint
  page_num: integer(),
  table_idx: integer(),
  page_title: text(),                    // NEW
  inserted_at: timestamp({ mode: 'string' }).defaultNow(),  // NEW
  updated_at: timestamp({ mode: 'string' }).defaultNow(),   // NEW
});
```

### New Helper Functions

Following the same pattern as Unifi API:

1. **`generateChannelBreakdown(data)`**
   - Aggregates viewers by channel
   - Calculates total viewers, record count, unique regions
   - Sorts by total viewers (descending)

2. **`generateRegionalBreakdown(data)`**
   - Aggregates viewers by region
   - Calculates total viewers, record count, unique channels
   - Sorts by total viewers (descending)

3. **`generateMonthlyTrends(data)`**
   - Aggregates viewers by month
   - Sorts by Malay month order (Januari → Disember)
   - Includes channel count per month

### API Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | integer | Page number (default: 1) | `?page=2` |
| `limit` | integer | Records per page (default: 50) | `?limit=100` |
| `sortBy` | string | Sort field (default: 'viewers') | `?sortBy=year` |
| `sortOrder` | string | Sort direction (default: 'desc') | `?sortOrder=asc` |
| `region` | string | Filter by region | `?region=Kuala Lumpur` |
| `channel` | string | Filter by channel(s) | `?channel=TV1,TV2` |
| `month` | string | Filter by month | `?month=Januari` |
| `year` | string | Filter by year | `?year=2025` |
| `metric` | string | Filter by metric | `?metric=MAU` |

### Response Structure

```json
{
  "data": [
    {
      "id": 1,
      "channel": "TV1",
      "region": "Kuala Lumpur",
      "month": "Januari",
      "year": 2025,
      "viewers": 1500000,
      "metric": "MAU",
      "page_num": 1,
      "table_idx": 1,
      "page_title": "News Coverage",
      "inserted_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 300,
    "totalPages": 6,
    "hasNext": true,
    "hasPrev": false
  },
  "summary": {
    "totalRecords": 300,
    "totalViewers": 50000000,
    "avgViewers": 166667,
    "totalRegions": 6,
    "totalChannels": 7,
    "totalYears": 2,
    "totalMonths": 12
  },
  "regionalBreakdown": [
    {
      "region": "Kuala Lumpur",
      "totalViewers": 10000000,
      "recordCount": 84,
      "channelCount": 7,
      "avgViewers": 119048
    }
  ],
  "channelBreakdown": [
    {
      "channel": "TV1",
      "totalViewers": 12000000,
      "recordCount": 72,
      "regionCount": 6,
      "avgViewers": 166667
    }
  ],
  "monthlyTrends": [
    {
      "month": "Januari",
      "totalViewers": 5000000,
      "avgViewers": 200000,
      "channelCount": 7
    }
  ],
  "filters": {
    "region": null,
    "channel": null,
    "month": null,
    "year": "2025",
    "metric": null,
    "sortBy": "viewers",
    "sortOrder": "desc"
  },
  "meta": {
    "queryType": "mytv_viewership_db",
    "timestamp": "2025-10-09T...",
    "totalRecords": 300
  }
}
```

### Benefits of This Approach

✅ **Consistency**
- Same pattern as Unifi API
- Easier to maintain
- Predictable behavior

✅ **Type Safety**
- Drizzle ORM provides full TypeScript support
- Auto-completion for table fields
- Compile-time error checking

✅ **Simplicity**
- No complex fallback logic
- Single data source (database)
- Clear error messages

✅ **Performance**
- One database query to fetch all data
- In-memory aggregations (fast for moderate datasets)
- Efficient filtering with Drizzle

✅ **Debugging**
- Console logs at each step
- Detailed error information
- Easy to trace issues

## Testing

### Test the API
```bash
# Basic query
curl http://localhost:3001/api/mytv-viewership

# With filters
curl "http://localhost:3001/api/mytv-viewership?year=2025&channel=TV1"

# With pagination
curl "http://localhost:3001/api/mytv-viewership?page=2&limit=100"

# With sorting
curl "http://localhost:3001/api/mytv-viewership?sortBy=viewers&sortOrder=desc"
```

### Check Console Logs
The API now logs:
- Request parameters
- Number of filter conditions
- Number of records fetched
- Analytics generation status
- Any errors with full stack traces

## Migration Notes

**No Breaking Changes**
- Response structure remains the same
- All existing filters work
- Frontend code needs no changes

**Database Requirements**
- Ensure `mytv_viewership` table exists
- Table must have data
- Database connection must be configured in `.env.local`

## Next Steps

1. ✅ Code refactored to match Unifi pattern
2. ✅ Schema updated with all fields
3. ✅ Type-safe queries implemented
4. ✅ Better error handling added
5. ⏳ Test with real database data
6. ⏳ Monitor performance with large datasets
7. ⏳ Add database indexes if needed

---

**Status**: ✅ **Complete - Clean Drizzle ORM Implementation**
**Pattern**: Same as Unifi TV API
**Date**: October 9, 2025
