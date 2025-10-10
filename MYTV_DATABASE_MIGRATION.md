# MyTV Viewership - Database Migration Summary

## Overview
Migrated the MyTV Viewership dashboard from mock data to real database queries using the `mytv_viewership` and `mytv_analysis` tables.

## Changes Made

### 1. Database Schema (`drizzle/schema.ts`)
- ✅ Added `mytvViewership` table schema with the following fields:
  - `id` (serial, primary key)
  - `channel` (varchar)
  - `region` (varchar)
  - `month` (varchar)
  - `year` (integer)
  - `viewers` (integer)
  - `metric` (varchar)
  - `page_num` (integer)
  - `table_idx` (integer)

### 2. API Route (`src/app/api/mytv-viewership/route.ts`)

#### Removed:
- ❌ Mock data generation functions (`generateMockMytvData`, `generateChannelBreakdown`, `generateRegionalBreakdown`, `generateMonthlyTrends`)
- ❌ Client-side filtering and aggregation

#### Added:
- ✅ Database imports from `drizzle-orm` and schema
- ✅ Real SQL queries using Drizzle ORM
- ✅ Server-side filtering with WHERE clauses
- ✅ Efficient aggregation queries for:
  - Summary statistics (total viewers, avg viewers, counts)
  - Regional breakdown (viewers per region)
  - Channel breakdown (viewers per channel)
  - Monthly trends (viewers per month with proper ordering)

#### Key Features:
- **Pagination**: Server-side pagination with configurable page size
- **Filtering**: Support for region, channel, month, and year filters
- **Sorting**: Configurable sorting by viewers, year, or channel
- **Aggregations**: Real-time calculations from database
- **Performance**: Optimized queries with proper indexing potential

### 3. Query Structure

#### Main Data Query
```sql
SELECT id, channel, region, month, year, viewers, metric, page_num, table_idx
FROM mytv_viewership
WHERE [filters]
ORDER BY [sortBy] [sortOrder]
LIMIT [limit] OFFSET [offset]
```

#### Summary Statistics
```sql
SELECT 
  COUNT(*) as total_records,
  SUM(viewers) as total_viewers,
  AVG(viewers) as avg_viewers,
  COUNT(DISTINCT region) as total_regions,
  COUNT(DISTINCT channel) as total_channels,
  COUNT(DISTINCT year) as total_years,
  COUNT(DISTINCT month) as total_months
FROM mytv_viewership
WHERE [filters]
```

#### Regional Breakdown
```sql
SELECT 
  region,
  COUNT(*) as record_count,
  SUM(viewers) as total_viewers,
  AVG(viewers) as avg_viewers,
  COUNT(DISTINCT channel) as channel_count
FROM mytv_viewership
WHERE [filters]
GROUP BY region
ORDER BY total_viewers DESC
```

#### Channel Breakdown
```sql
SELECT 
  channel,
  COUNT(*) as record_count,
  SUM(viewers) as total_viewers,
  AVG(viewers) as avg_viewers,
  COUNT(DISTINCT region) as region_count
FROM mytv_viewership
WHERE [filters]
GROUP BY channel
ORDER BY total_viewers DESC
```

#### Monthly Trends
```sql
SELECT 
  month,
  SUM(viewers) as total_viewers,
  AVG(viewers) as avg_viewers,
  COUNT(DISTINCT channel) as channel_count
FROM mytv_viewership
WHERE [filters]
GROUP BY month
ORDER BY [month order - Januari to Disember]
```

## API Response Structure

The API now returns real data with the following structure:

```json
{
  "data": [...],           // Paginated viewership records
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "totalPages": 20,
    "hasNext": true,
    "hasPrev": false
  },
  "summary": {
    "totalRecords": 1000,
    "totalViewers": 50000000,
    "avgViewers": 50000,
    "totalRegions": 6,
    "totalChannels": 7,
    "totalYears": 2,
    "totalMonths": 12
  },
  "regionalBreakdown": [...],  // Aggregated by region
  "channelBreakdown": [...],    // Aggregated by channel
  "monthlyTrends": [...],       // Aggregated by month
  "filters": {...},             // Applied filters
  "meta": {
    "queryType": "mytv_viewership_database",
    "timestamp": "2025-10-08T...",
    "totalRecords": 1000
  }
}
```

## Database Requirements

### Required Table: `mytv_viewership`
Ensure this table exists in your PostgreSQL database with the schema defined above.

### Sample SQL to Create Table (if needed):
```sql
CREATE TABLE mytv_viewership (
  id SERIAL PRIMARY KEY,
  channel VARCHAR(255),
  region VARCHAR(255),
  month VARCHAR(50),
  year INTEGER,
  viewers INTEGER,
  metric VARCHAR(100),
  page_num INTEGER,
  table_idx INTEGER
);

-- Recommended indexes for performance
CREATE INDEX idx_mytv_viewership_channel ON mytv_viewership(channel);
CREATE INDEX idx_mytv_viewership_region ON mytv_viewership(region);
CREATE INDEX idx_mytv_viewership_year ON mytv_viewership(year);
CREATE INDEX idx_mytv_viewership_month ON mytv_viewership(month);
CREATE INDEX idx_mytv_viewership_viewers ON mytv_viewership(viewers DESC);
```

## Environment Configuration

Ensure your `.env` or `.env.local` file has the database connection string:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

## Frontend (No Changes Required)

The React component (`src/app/MyTVViewership/page.tsx`) remains unchanged and will automatically work with the real data API.

## Testing Checklist

- [ ] Verify database connection is working
- [ ] Ensure `mytv_viewership` table exists and has data
- [ ] Test API endpoint: `GET /api/mytv-viewership`
- [ ] Test filters: region, channel, month, year
- [ ] Test pagination: page and limit parameters
- [ ] Test sorting: sortBy and sortOrder parameters
- [ ] Verify charts render correctly with real data
- [ ] Check performance with large datasets

## Migration Notes

1. **Data Migration**: If you have existing data in `mytv_analysis` table, you may need to migrate or transform it to the `mytv_viewership` table format.

2. **Backward Compatibility**: The API response structure is identical to the mock version, ensuring zero breaking changes for the frontend.

3. **Performance**: Database queries are optimized with aggregations happening at the database level rather than in JavaScript.

4. **Error Handling**: The API includes proper error handling with detailed error messages in development mode.

## Next Steps

1. Populate the `mytv_viewership` table with actual data
2. Add database indexes for better query performance
3. Consider adding caching layer for frequently accessed data
4. Monitor query performance and optimize as needed
5. Set up database backup and recovery procedures

---

**Date**: October 8, 2025
**Status**: ✅ Complete - Ready for database connection
