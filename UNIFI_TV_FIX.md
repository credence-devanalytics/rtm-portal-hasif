# Unifi TV Viewership - HTTP 500 Error Fix

## Problem
The UnifiTV dashboard page was showing a "⚠️ Data loading issue: HTTP error! status: 500. Displaying with sample data." error.

## Root Cause
The Drizzle ORM schema definition for the `unifi_viewership` table had a mismatch with the actual database schema:
- **Schema file** (`drizzle/schema.ts`): Used `pk` as the primary key column name
- **Actual database**: Uses `id` as the primary key column name

This mismatch caused the Drizzle ORM to fail when trying to fetch data from the database, resulting in a 500 error.

## Solution Applied

### 1. Fixed Schema Definition
Updated `drizzle/schema.ts` to match the actual database structure:

**Before:**
```typescript
export const unifiViewership = pgTable("unifi_viewership", {
	pk: serial().primaryKey().notNull(),
	viewershipMonthYear: varchar("viewership_month_year", { length: 10 }),
	channelName: varchar("channel_name", { length: 50 }),
	// ... other fields
});
```

**After:**
```typescript
export const unifiViewership = pgTable("unifi_viewership", {
	id: serial().primaryKey().notNull(),
	viewershipMonthYear: text("viewership_month_year"),
	channelName: text("channel_name"),
	// ... other fields
});
```

Also updated field types to match database (changed from `varchar` to `text` where applicable).

### 2. Updated API Route
Changed the API response mapping in `src/app/api/unifi-viewership/route.ts`:

**Before:**
```typescript
data: paginatedData.map(item => ({
  ...item,
  mau: parseInt(String(item.mau)) || 0,
  pk: parseInt(String(item.pk)) || 0
})),
```

**After:**
```typescript
data: paginatedData.map(item => ({
  ...item,
  mau: parseInt(String(item.mau)) || 0,
  id: parseInt(String(item.id)) || 0
})),
```

### 3. Enhanced Error Handling
Added comprehensive error logging and handling in the API route:
- Database connection validation
- Detailed console logging for debugging
- Better error messages with stack traces in development mode
- Graceful handling of empty data sets
- Try-catch blocks around analytics generation

### 4. Improved Frontend Error Display
Updated the frontend to show more detailed error messages:
- Displays API error details when available
- Better error parsing from API responses
- Validation of data format before setting state

## Database Information
- **Database**: PostgreSQL (rtmmedina)
- **Table**: `unifi_viewership`
- **Total Records**: 2,887
- **Available Channels**: TV1, TV2
- **Available Months**: 202408 - 202505
- **Primary Key**: `id` (integer, auto-increment)

## Testing
Created test scripts to verify the fix:
1. `test_unifi_db.js` - Validates database connection and data availability
2. `check_unifi_schema.js` - Verifies table schema structure
3. `test_unifi_api.js` - Tests API endpoints with various filters

All tests pass successfully.

## Result
✅ The UnifiTV dashboard now loads data correctly without the 500 error.
✅ API returns proper data for all filter combinations.
✅ Analytics are generated correctly (program breakdown, channel breakdown, monthly trends, top programs).

## Files Modified
1. `drizzle/schema.ts` - Fixed schema definition
2. `src/app/api/unifi-viewership/route.ts` - Enhanced error handling and fixed field mapping
3. `src/app/UnifiTV/page.tsx` - Improved error display

## Files Created (for testing)
1. `test_unifi_db.js`
2. `check_unifi_schema.js`
3. `test_unifi_api.js`
