# Testing Guide: Popular Posts Dynamic Sorting

## Quick Test Checklist

### ✅ Pre-Test Setup
- [ ] Database is running and accessible
- [ ] Development server is running (`pnpm dev`)
- [ ] Browser DevTools is open (Console + Network tabs)
- [ ] Navigate to `/dashboard` page

---

## Test Cases

### Test 1: Initial Load (Default Sort by Reach)
**Expected Behavior:**
- [ ] Posts load with "By Reach" button highlighted
- [ ] Posts are ordered by reach (highest first)
- [ ] Console shows: `"📊 Sorting by reach"`
- [ ] Network tab shows request with `sort=reach` parameter

**Verify:**
```
First post should have highest reach value
Check post.reach values are in descending order
```

---

### Test 2: Sort by Engagement
**Steps:**
1. Click "By Engagement" button

**Expected Behavior:**
- [ ] "By Engagement" button becomes highlighted
- [ ] Loading indicator appears briefly
- [ ] Posts re-order by total interactions
- [ ] Console shows: `"🔄 Changing posts sort to: interactions"`
- [ ] Console shows: `"📊 Sorting by interactions"`
- [ ] Network request with `sort=interactions` parameter

**Verify:**
```javascript
// In Console, check first post:
// totalInteractions = likecount + sharecount + commentcount
// Should be highest value
```

---

### Test 3: Sort by Date
**Steps:**
1. Click "By Date" button

**Expected Behavior:**
- [ ] "By Date" button becomes highlighted
- [ ] Posts re-order by most recent first
- [ ] Console shows: `"🔄 Changing posts sort to: date"`
- [ ] Console shows: `"📊 Sorting by date"`
- [ ] Network request with `sort=date` parameter

**Verify:**
```
First post should have most recent inserttime
Dates should be in descending order (newest first)
```

---

### Test 4: Switch Between Sorts
**Steps:**
1. Click "By Reach"
2. Wait for data load
3. Click "By Engagement"
4. Wait for data load
5. Click "By Date"
6. Click "By Reach" again

**Expected Behavior:**
- [ ] Each click triggers new API request
- [ ] Active button changes each time
- [ ] Post order changes appropriately
- [ ] No errors in console
- [ ] Smooth transitions (loading states work)

**Performance Check:**
- [ ] Second click on same sort should be instant (cached)
- [ ] React Query cache working (check Network tab)

---

### Test 5: Sort + Filter Combination
**Steps:**
1. Apply sentiment filter (e.g., "Positive")
2. Click "By Engagement"
3. Apply source filter (e.g., "Facebook")
4. Click "By Date"

**Expected Behavior:**
- [ ] Filters AND sort work together
- [ ] Each action triggers new query
- [ ] URL parameters include both filters and sort
- [ ] Results match all criteria (filtered + sorted)

**Verify Network Request:**
```
/api/social-media/popular-posts?
  sentiments=positive&
  sources=facebook&
  sort=date
```

---

### Test 6: Error Handling
**Steps:**
1. Stop database connection (if possible)
2. Click sort buttons

**Expected Behavior:**
- [ ] Fallback data displays
- [ ] Error is logged but not shown to user
- [ ] Console shows: `"❌ Database error, using fallback data"`
- [ ] Sort buttons still work with fallback data

---

### Test 7: Loading States
**Steps:**
1. Throttle network to "Slow 3G" in DevTools
2. Click different sort buttons

**Expected Behavior:**
- [ ] Loading skeleton/spinner appears
- [ ] Previous data remains visible during load
- [ ] No flicker or jump
- [ ] Smooth transition to new data

---

## Console Debugging Commands

### Check Current Data
```javascript
// In browser console:

// Check what's in component
$r.props.data

// Check current sort
$r.props.currentSort

// Check if loading
$r.props.isLoading
```

### Check React Query Cache
```javascript
// See all cached queries
window.queryClient.getQueryCache().getAll()

// Find popular posts queries
window.queryClient.getQueryCache().getAll().filter(q => 
  q.queryKey[1] === 'popular-posts'
)
```

### Manually Trigger Sort
```javascript
// Trigger sort change directly
$r.props.onSortChange('interactions')
```

---

## Network Tab Verification

### Request URL Format
```
/api/social-media/popular-posts?
  sort=reach                    // or interactions, or date
  &limit=20                     // default limit
  &sentiments=positive,neutral  // optional
  &sources=facebook,twitter     // optional
  &date_from=2024-01-01        // optional
  &date_to=2024-12-31          // optional
```

### Response Structure
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "content": "...",
      "reach": 50000,
      "likecount": 500,
      "sharecount": 100,
      "commentcount": 50,
      "totalInteractions": 650,
      "sentiment": "positive",
      "type": "Facebook",
      "inserttime": "2024-10-13T...",
      ...
    }
  ],
  "meta": {
    "filters": {...},
    "sortBy": "reach",
    "dataSource": "database",
    "totalPosts": 20,
    "queryTime": "..."
  }
}
```

---

## Performance Benchmarks

### Expected Response Times
- **Database query**: < 200ms
- **API response**: < 500ms
- **Total render**: < 1000ms

### Check in Network Tab:
- Look for "Time" column
- Compare different sort methods
- Interactions sort might be slightly slower (calculated field)

---

## Common Issues & Solutions

### Issue: Button click doesn't trigger new query
**Check:**
- [ ] `onSortChange` prop is passed
- [ ] Handler is defined in parent
- [ ] State is updating (use React DevTools)

**Solution:**
```javascript
// Verify in parent component
const handlePostsSortChange = useCallback((newSort) => {
  console.log("Sort changing to:", newSort);
  setPostsSortBy(newSort);
}, []);
```

---

### Issue: Data doesn't change when sorting
**Check:**
- [ ] Query key includes sortBy parameter
- [ ] API receives sort parameter
- [ ] Database query uses correct ORDER BY

**Debug:**
```javascript
// Check query key
QUERY_KEYS.popularPosts(filters, postsSortBy)
// Should change when postsSortBy changes
```

---

### Issue: Same data for all sort methods
**Check:**
- [ ] API route switch statement is working
- [ ] sortBy parameter is being read correctly
- [ ] Database columns exist and have data

**Verify API:**
```javascript
// In route.js, add more logging
console.log('Received sortBy:', sortBy);
console.log('Using order clause:', orderByClause);
```

---

### Issue: Loading state stuck
**Check:**
- [ ] Database connection is working
- [ ] No errors in console
- [ ] React Query isn't in error state

**Reset:**
```javascript
// Clear React Query cache
queryClient.clear()
// Or invalidate specific query
queryClient.invalidateQueries(['social-media', 'popular-posts'])
```

---

## SQL Queries to Verify Data

### Check data exists:
```sql
SELECT 
  COUNT(*) as total_posts,
  COUNT(CASE WHEN reach > 0 THEN 1 END) as posts_with_reach,
  COUNT(CASE WHEN likecount > 0 THEN 1 END) as posts_with_likes,
  MAX(reach) as max_reach,
  MAX(likecount + sharecount + commentcount) as max_interactions
FROM mentions_classify_public
WHERE autosentiment IS NOT NULL;
```

### View top posts by reach:
```sql
SELECT id, author, reach, likecount, sharecount, commentcount
FROM mentions_classify_public
WHERE autosentiment IS NOT NULL
ORDER BY reach DESC
LIMIT 5;
```

### View top posts by engagement:
```sql
SELECT 
  id, 
  author, 
  (likecount + sharecount + commentcount) as total_interactions,
  reach
FROM mentions_classify_public
WHERE autosentiment IS NOT NULL
ORDER BY (likecount + sharecount + commentcount) DESC
LIMIT 5;
```

### View most recent posts:
```sql
SELECT id, author, inserttime, reach
FROM mentions_classify_public
WHERE autosentiment IS NOT NULL
ORDER BY inserttime DESC
LIMIT 5;
```

---

## Success Criteria

### All tests pass when:
✅ All three sort buttons work correctly
✅ Data re-fetches on each sort change
✅ Correct button is highlighted
✅ Posts are in correct order for each sort
✅ Filters work with sorting
✅ No console errors
✅ Loading states display properly
✅ React Query caching works
✅ Network requests show correct parameters
✅ Database queries execute efficiently

---

**Testing Date**: October 13, 2025
**Status**: Ready for QA Testing
