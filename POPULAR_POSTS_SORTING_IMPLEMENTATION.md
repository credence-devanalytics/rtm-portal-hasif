# Popular Posts Dynamic Sorting Implementation

## Overview
Implemented database-driven sorting for the Most Popular Posts component. When users click "By Reach", "By Engagement", or "By Date" buttons, a new SQL query is executed to fetch data sorted by the selected criteria.

## Changes Made

### 1. API Route Enhancement (`src/app/api/social-media/popular-posts/route.js`)

**Added Dynamic SQL Sorting:**
- The API now accepts a `sort` query parameter with three options: `reach`, `interactions`, or `date`
- SQL queries are dynamically built based on the sort parameter:
  - **By Reach**: `ORDER BY reach DESC`
  - **By Engagement**: `ORDER BY (likecount + sharecount + commentcount) DESC`
  - **By Date**: `ORDER BY inserttime DESC`

**Enhanced Logging:**
- Added console logs to track which sort method is being used
- Helps with debugging and monitoring query performance

### 2. Component Updates (`src/components/dashboard/public-mentions/most-popular-posts.jsx`)

**Removed Client-Side Sorting:**
- Deleted local `sortBy` state and client-side sorting logic
- Data now comes pre-sorted from the database (more efficient)

**Added Props:**
- `onSortChange`: Callback function to trigger new database queries
- `currentSort`: Current sort method to highlight the active button

**Updated Sort Buttons:**
- Buttons now call `handleSortChange()` instead of local state updates
- This triggers a new API call to fetch freshly sorted data

### 3. Parent Component Updates (`src/app/dashboard/page.jsx`)

**Added State Management:**
- `postsSortBy`: State to track current sorting method (default: "reach")

**Updated Fetch Function:**
```javascript
const fetchPopularPosts = async (filters, sortBy = "reach") => {
  const params = filterUtils.toUrlParams(filters);
  const sortParam = `&sort=${sortBy}`;
  const response = await fetch(`/api/social-media/popular-posts?${params}${sortParam}`);
  // ...
};
```

**Updated Query Key:**
```javascript
popularPosts: (filters, sortBy = "reach") => 
  ["social-media", "popular-posts", filters, sortBy]
```
- Query key now includes `sortBy` parameter
- This ensures React Query caches different sort results separately

**Added Sort Change Handler:**
```javascript
const handlePostsSortChange = useCallback((newSort) => {
  console.log("🔄 Changing posts sort to:", newSort);
  setPostsSortBy(newSort);
}, []);
```

**Updated Component Props:**
```jsx
<MostPopularPosts
  data={popularPostsData?.data}
  onPostClick={handlePostClick}
  activeFilters={filters}
  isLoading={isLoadingPopular}
  onSortChange={handlePostsSortChange}
  currentSort={postsSortBy}
/>
```

## How It Works

### User Flow:
1. User clicks one of the sort buttons (By Reach / By Engagement / By Date)
2. `handleSortChange()` is called in the component
3. This triggers `handlePostsSortChange()` in the parent
4. Parent updates `postsSortBy` state
5. React Query detects the query key change
6. New API request is made with the `sort` parameter
7. Database executes a new SQL query with appropriate ORDER BY clause
8. Sorted data is returned and displayed

### Benefits:
✅ **Database-Level Sorting**: More efficient, especially with large datasets
✅ **Proper Indexing**: Database can use indexes for faster sorting
✅ **Reduced Client Load**: No need to sort thousands of records in JavaScript
✅ **React Query Caching**: Different sort results are cached separately
✅ **Better Performance**: Leverages database optimization

## SQL Queries Generated

### By Reach:
```sql
SELECT * FROM mentions_classify_public
WHERE autosentiment IS NOT NULL
  AND (reach > 0 OR likecount > 0 OR sharecount > 0 OR commentcount > 0)
ORDER BY reach DESC
LIMIT 20;
```

### By Engagement:
```sql
SELECT * FROM mentions_classify_public
WHERE autosentiment IS NOT NULL
  AND (reach > 0 OR likecount > 0 OR sharecount > 0 OR commentcount > 0)
ORDER BY (COALESCE(likecount, 0) + COALESCE(sharecount, 0) + COALESCE(commentcount, 0)) DESC
LIMIT 20;
```

### By Date:
```sql
SELECT * FROM mentions_classify_public
WHERE autosentiment IS NOT NULL
  AND (reach > 0 OR likecount > 0 OR sharecount > 0 OR commentcount > 0)
ORDER BY inserttime DESC
LIMIT 20;
```

## Testing

To verify the implementation:

1. **Check Console Logs:**
   - Open browser DevTools
   - Watch for: `"🔄 Changing posts sort to: [reach/interactions/date]"`
   - Watch for: `"📊 Sorting by [reach/interactions/date]"`

2. **Network Tab:**
   - Check API calls to `/api/social-media/popular-posts`
   - Verify `sort` parameter is included in URL
   - Different sort methods should trigger new requests

3. **Visual Verification:**
   - Click "By Reach" - posts with highest reach should appear first
   - Click "By Engagement" - posts with most likes+shares+comments first
   - Click "By Date" - most recent posts should appear first

## Future Enhancements

Potential improvements:
- Add ascending/descending toggle
- Add pagination for large datasets
- Add additional sort options (by sentiment confidence, by author, etc.)
- Add loading indicator during sort changes
- Add sort preference persistence (localStorage)

## Files Modified

1. `src/app/api/social-media/popular-posts/route.js`
2. `src/components/dashboard/public-mentions/most-popular-posts.jsx`
3. `src/app/dashboard/page.jsx`

---

**Implementation Date**: October 13, 2025
**Status**: ✅ Complete and Ready for Testing
