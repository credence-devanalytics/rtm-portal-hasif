# Remaining API Routes to Update for Author Filtering

## ✅ Already Updated
1. `/api/social-media/popular-posts/route.js` - ✅ Complete

## 🔄 Need to Update

### High Priority (Core Dashboard APIs)

#### 1. `/api/social-media/metrics/route.js`
**What it does**: Aggregated metrics (total posts, reach, interactions)  
**Update needed**: 
- Import `or` from drizzle-orm
- Add `authorsParam` parameter extraction
- Add authors to filters object
- Update `buildWhereConditions()` to include author filter

```javascript
// Add to imports
import { gte, lte, and, sql, count, sum, avg, inArray, like, or } from 'drizzle-orm';

// Add to parameter extraction
const authorsParam = searchParams.get('authors');

// Add to filters object
authors: authorsParam ? authorsParam.split(',') : [],

// Add to buildWhereConditions()
if (filters.authors && filters.authors.length > 0) {
  conditions.push(inArray(mentionsClassifyPublic.author, filters.authors));
}
```

#### 2. `/api/social-media/sentiment-by-source/route.js`
**What it does**: Sentiment distribution by platform  
**Update needed**: Same as above

#### 3. `/api/social-media/sentiment-timeline/route.js`
**What it does**: Time series sentiment data  
**Update needed**: Same as above

#### 4. `/api/social-media/top-authors/route.js`
**What it does**: Top authors statistics  
**Update needed**: Same as above
**Note**: This should filter OUT the selected authors to show other authors when filtered

#### 5. `/api/social-media/sentiment-by-topics/route.js`
**What it does**: Topic-based sentiment breakdown  
**Update needed**: Same as above

#### 6. `/api/social-media/engagement-rate/route.js`
**What it does**: Engagement metrics over time  
**Update needed**: Same as above

#### 7. `/api/social-media/public_mentions/route.js`
**What it does**: List of all mentions  
**Update needed**: Same as above

### Template for Quick Updates

Copy this code block into each route's `buildWhereConditions()` function:

```javascript
// Author filters (ADD THIS)
if (filters.authors && filters.authors.length > 0) {
  conditions.push(inArray(mentionsClassifyPublic.author, filters.authors));
}
```

And update the parameter extraction section:

```javascript
// FROM:
const sentimentsParam = searchParams.get('sentiments');
const sourcesParam = searchParams.get('sources');
const dateFromParam = searchParams.get('date_from');
const dateToParam = searchParams.get('date_to');

// TO:
const sentimentsParam = searchParams.get('sentiments');
const sourcesParam = searchParams.get('sources');
const authorsParam = searchParams.get('authors'); // ADD THIS
const dateFromParam = searchParams.get('date_from');
const dateToParam = searchParams.get('date_to');
```

And update the filters object:

```javascript
// FROM:
const filters = {
  sentiments: sentimentsParam ? sentimentsParam.split(',') : [],
  sources: sourcesParam ? sourcesParam.split(',') : [],
  dateRange: {
    from: dateFromParam,
    to: dateToParam
  }
};

// TO:
const filters = {
  sentiments: sentimentsParam ? sentimentsParam.split(',') : [],
  sources: sourcesParam ? sourcesParam.split(',') : [],
  authors: authorsParam ? authorsParam.split(',') : [], // ADD THIS
  dateRange: {
    from: dateFromParam,
    to: dateToParam
  }
};
```

### Import Updates

If not already imported, add `or` to drizzle-orm imports:

```javascript
// FROM:
import { gte, lte, and, sql, inArray, like } from 'drizzle-orm';

// TO:
import { gte, lte, and, sql, inArray, like, or } from 'drizzle-orm';
```

## Alternative: Use Shared Helper

Instead of updating each route individually, you can use the shared helper:

```javascript
// At the top of the file
import { buildWhereConditions, parseFilterParams } from '@/lib/api-helpers';

// Replace the local buildWhereConditions function with:
// (remove the local function entirely)

// In the GET handler, replace manual param extraction with:
const filters = parseFilterParams(searchParams);

// Then use:
const whereConditions = buildWhereConditions(filters, mentionsClassifyPublic);
```

This approach is cleaner but requires more changes per file.

## Testing After Updates

After updating each route, test with:

```bash
# Test in browser console or Postman
fetch('/api/social-media/metrics?authors=John Doe&sentiments=positive')
  .then(r => r.json())
  .then(console.log)
```

Check that:
- ✅ No errors in response
- ✅ Data is filtered correctly
- ✅ Meta information includes author filter
- ✅ Console logs show author filter being applied

## Batch Update Script (PowerShell)

```powershell
# Run this to update all routes at once
# WARNING: Review changes before committing!

$routes = @(
    "metrics",
    "sentiment-by-source",
    "sentiment-timeline",
    "top-authors",
    "sentiment-by-topics",
    "engagement-rate",
    "public_mentions"
)

foreach ($route in $routes) {
    $file = "src/app/api/social-media/$route/route.js"
    Write-Host "Updating $file..."
    # Add your update logic here
}
```

## Priority Order

Update in this order for best results:

1. **metrics** - Core dashboard numbers
2. **sentiment-by-source** - Main chart
3. **sentiment-timeline** - Time series chart
4. **top-authors** - Critical for cross-filtering UX
5. **engagement-rate** - Engagement chart
6. **sentiment-by-topics** - Topics chart
7. **public_mentions** - Detailed list view

## Verification Checklist

After all updates:

- [ ] All API routes accept `authors` parameter
- [ ] Author filter works in isolation
- [ ] Author + sentiment filter combination works
- [ ] Author + source filter combination works
- [ ] Author + date range filter combination works
- [ ] All charts update when author is clicked
- [ ] No console errors
- [ ] Author badge appears in FilterControls
- [ ] Can remove author filter
- [ ] Toggle author filter (click twice)

---

**Status**: 1/7 routes updated  
**Estimated Time**: 30-45 minutes to update all routes  
**Next**: Start with `/api/social-media/metrics/route.js`
