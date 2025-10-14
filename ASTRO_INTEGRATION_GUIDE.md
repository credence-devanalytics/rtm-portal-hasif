# Astro Rate & Reach Integration Guide

## ✅ What's Been Implemented

### 1. Database Schema
- **Table**: `astro_rate_n_reach`
- **Location**: `drizzle/schema.ts`
- **Columns**:
  - `id` - SERIAL PRIMARY KEY
  - `tx_date` - DATE
  - `tx_year` - INTEGER
  - `tx_month` - INTEGER
  - `channel` - TEXT
  - `metric_type` - TEXT ('rating' or 'reach')
  - `value` - INTEGER

### 2. API Endpoint
- **Route**: `/api/astro-rate-reach`
- **File**: `src/app/api/astro-rate-reach/route.js`
- **Features**:
  - Full data retrieval
  - Filtering by year, month, channel, metric type, date range
  - Aggregation with `groupBy` parameter
  - Returns available filters and summary statistics

### 3. Frontend Integration
- **File**: `src/app/Multiplatform/page.tsx`
- **Features**:
  - Data fetching via `useEffect`
  - Metrics calculation via `useMemo`
  - Four-box display showing:
    1. **Top Rated Channel** (highest rating) - ⭐
    2. **Top Reach Channel** (highest reach) - 📈
    3. **Total Reach** (sum of all reach) - 👥
    4. **Lowest Rating Channel** (minimum rating, non-zero) - 🏆

## 📊 Metrics Display Order

The ASTRO card displays metrics in this grid layout:

```
┌─────────────────────────┬─────────────────────────┐
│ Top Rated Channel ⭐    │ Top Reach Channel 📈     │
│ (highest rating value)  │ (highest reach value)   │
├─────────────────────────┼─────────────────────────┤
│ Total Reach 👥          │ Lowest Rating Channel 🏆│
│ (sum of all reach)      │ (minimum rating, >0)    │
└─────────────────────────┴─────────────────────────┘
```

## 🔍 Debugging Tools

### 1. Diagnostic Page
Visit: `http://localhost:3000/astro-diagnostic`
- Shows raw API response
- Displays calculated metrics
- Shows record breakdown
- Lists sample data

### 2. Browser Console
Open Developer Tools (F12) and look for:
```javascript
"Calculating Astro metrics..."
"Astro data success: true"
"Astro data length: XX"
"Rating records count: XX"
"Reach records count: XX"
"Final Astro metrics: {...}"
```

### 3. Direct API Test
Visit: `http://localhost:3000/api/astro-rate-reach`
Should return JSON with:
```json
{
  "success": true,
  "data": [...],
  "filters": {
    "channels": ["TV1", "TV2", ...],
    "metricTypes": ["rating", "reach"]
  },
  "summary": {
    "totalRecords": XX,
    "totalValue": XX,
    "avgValue": XX
  }
}
```

## 🎯 API Usage Examples

### Get all data
```javascript
fetch('/api/astro-rate-reach')
```

### Filter by year and channel
```javascript
fetch('/api/astro-rate-reach?year=2024&channel=TV1')
```

### Get aggregated data by channel
```javascript
fetch('/api/astro-rate-reach?groupBy=channel')
```

### Get data for specific metric type and date range
```javascript
fetch('/api/astro-rate-reach?metricType=rating&startDate=2024-01-01&endDate=2024-12-31')
```

### Group by multiple dimensions
```javascript
fetch('/api/astro-rate-reach?groupBy=channel,metric&year=2024')
```

## 📝 Sample Data Structure

Based on your query results, data should look like:
```json
{
  "id": 141,
  "tx_date": "2024-10-01",
  "tx_year": 2024,
  "tx_month": 10,
  "channel": "TV1",
  "metric_type": "reach",
  "value": 5856
}
```

## 🚀 How to Verify It's Working

1. **Check browser console** for Astro API logs
2. **Visit `/astro-diagnostic`** to see detailed breakdown
3. **Look at the ASTRO card** on `/Multiplatform` page:
   - Should show 4 metric boxes with real data
   - Should NOT show "No data available yet"
   - Each metric should have a channel name and value

## ⚠️ Troubleshooting

### If showing "No data (0)":

1. **Verify table has data**:
   ```sql
   SELECT COUNT(*) FROM astro_rate_n_reach;
   ```

2. **Check API response**:
   - Open Developer Tools (F12)
   - Go to Network tab
   - Refresh page
   - Look for `astro-rate-reach` request
   - Check if it returns data

3. **Check console logs**:
   - Look for "Astro data length: 0" (means no data)
   - Look for error messages

4. **Verify database connection**:
   - Other platforms (MyTV, Marketing) should be working
   - If they work, database connection is fine

### If data exists but not displaying:

1. Check that `astroMetrics.hasData` is `true` in console
2. Verify the metrics calculation is working
3. Check that the platform card is checking `hasAnyData` correctly

## 📄 Files Modified/Created

### Modified:
- `drizzle/schema.ts` - Added astroRateNReach table definition
- `src/app/Multiplatform/page.tsx` - Added data fetching and display logic

### Created:
- `src/app/api/astro-rate-reach/route.js` - API endpoint
- `src/app/astro-diagnostic/page.tsx` - Diagnostic page
- `test_astro_api.html` - Browser-based API tester
- `test_astro_table.js` - Node.js table checker
- `seed_astro_data.sql` - Sample data seed script
- `ASTRO_INTEGRATION_GUIDE.md` - This file

## ✨ Next Steps

1. If the ASTRO card is still showing "No data", visit `/astro-diagnostic`
2. Check the browser console for detailed logs
3. Verify your database query returns data:
   ```sql
   SELECT * FROM astro_rate_n_reach ORDER BY random() LIMIT 20;
   ```
4. If data exists but not showing, share the console logs for further debugging

The integration is complete and should work automatically once data is in the table! 🎉
