# Channel Group Implementation Summary

## Overview
Added support for the new `channelgroup` column to the `mentions_classify` table. This column specifically affects Radio Stations and their relationship to the `groupname` field.

## Database Schema Updates

### 1. Updated Schema Files
- **`src/lib/schema.ts`**: Added `channelgroup: text()` field to both `mentionsClassify` and `mentionsClassifyPublic` tables
- **`drizzle/schema.ts`**: Added `channelgroup: text()` field to both `mentionsClassify` and `mentionsClassifyPublic` tables

### 2. Schema Changes
```typescript
// Added to mentionsClassify table:
channel: text(),
channelgroup: text(),  // NEW FIELD
groupid: varchar(),

// Added to mentionsClassifyPublic table:
channel: text(),
channelgroup: text(),  // NEW FIELD  
groupid: varchar(),
```

## API Endpoints

### 1. New Channel Groups API
**File**: `src/app/api/channel-groups/route.js`
- **Endpoint**: `GET /api/channel-groups?type={filterType}`
- **Purpose**: Provides channel group analysis with the exact SQL query you requested
- **Query Parameters**:
  - `type`: Filter by category (`all`, `radio`, `tv`, `news`, `official`)
- **Returns**: Channel group breakdown with `groupname`, `channel`, `channelgroup`, and count

**Example API Response**:
```json
{
  "meta": {
    "filterType": "radio",
    "summary": {
      "totalRecords": 1250,
      "uniqueGroups": 15,
      "uniqueChannels": 25,
      "uniqueChannelGroups": 8
    }
  },
  "data": {
    "byChannelGroup": [...],
    "sqlFormat": [
      {
        "groupname": "Radio Nasional",
        "channel": "NASIONALfm",
        "channelgroup": "FM Stations",
        "count": 156
      }
    ]
  }
}
```

### 2. Updated Mentions API
**File**: `src/app/api/mentions/route.js`
- **Enhancement**: Added `channelGroupBreakdown` query to the existing comprehensive dashboard API
- **New Response Section**: `channelGroups` array with detailed channel group analysis
- **SQL Equivalent**: 
  ```sql
  SELECT groupname, channel, channelgroup, count(*), SUM(reach) 
  FROM mentions_classify 
  GROUP BY groupname, channel, channelgroup 
  ORDER BY count(*) DESC 
  LIMIT 100
  ```

## React Hooks

### 1. New Channel Groups Hook
**File**: `src/hooks/useChannelGroupsData.js`
- **Main Hook**: `useChannelGroupsData(filterType)`
- **Specialized Hooks**:
  - `useRadioChannelGroupsData()` - For radio stations specifically
  - `useTVChannelGroupsData()` - For TV channels
  - `useNewsChannelGroupsData()` - For news channels
  - `useOfficialChannelGroupsData()` - For official channels

### 2. Updated RTM Queries Hook
**File**: `src/hooks/useRTMQueries.js`
- **Enhancement**: Added `channel`, `channelgroup`, and `groupname` fields to the processed data objects
- **Impact**: All components using this hook now have access to channel group information

## React Components

### 1. New Channel Groups Table Component
**File**: `src/components/ChannelGroupsTable.jsx`
- **Purpose**: Displays channel group analysis in a searchable, sortable table
- **Features**:
  - Search functionality across all fields
  - Sorting by count, channel name, or channel group
  - Filter by category (radio, TV, news, etc.)
  - Summary statistics display
  - Responsive design

### 2. New Test Page
**File**: `src/app/channel-groups/page.jsx`
- **Purpose**: Test page to verify channel group functionality
- **URL**: `/channel-groups`
- **Features**:
  - Filter tabs for different categories
  - Live SQL query reference
  - API endpoint information
  - Interactive channel groups table

## Testing & Validation

### 1. Database Query Test Script
**File**: `check_channelgroup.js`
- **Purpose**: Validates the new channel group column structure and data
- **SQL Query**: 
  ```sql
  SELECT groupname, channel, channelgroup, count(*) 
  FROM mentions_classify 
  GROUP BY groupname, channel, channelgroup 
  ORDER BY channelgroup
  ```

### 2. Radio Stations Focus
The implementation specifically addresses your requirement that the `channelgroup` column affects Radio Stations and their `groupname` relationship:

- Radio stations are identified by `groupname` containing "radio"
- Each radio channel now has its own `channelgroup` assignment
- The relationship between `groupname`, `channel`, and `channelgroup` is preserved and queryable

## Migration Steps

### 1. Database Migration Required
```sql
-- Add channelgroup column to mentions_classify table
ALTER TABLE mentions_classify ADD COLUMN channelgroup TEXT;

-- Add channelgroup column to mentions_classify_public table  
ALTER TABLE mentions_classify_public ADD COLUMN channelgroup TEXT;
```

### 2. Data Population
After adding the columns, you'll need to populate the `channelgroup` data based on your business logic for how channels should be grouped.

## Usage Examples

### 1. API Usage
```javascript
// Get all radio channel groups
const radioData = await fetch('/api/channel-groups?type=radio');

// Get comprehensive dashboard data (now includes channel groups)
const dashboardData = await fetch('/api/mentions');
```

### 2. React Hook Usage
```jsx
// In a React component
import { useRadioChannelGroupsData } from '@/hooks/useChannelGroupsData';

function RadioAnalysis() {
  const { data, isLoading } = useRadioChannelGroupsData();
  
  // data.data.sqlFormat contains the exact SQL query format you requested
  return <ChannelGroupsTable filterType="radio" />;
}
```

### 3. Direct SQL Query
```sql
-- Your requested query now works with the new schema
SELECT groupname, channel, channelgroup, count(*) 
FROM mentions_classify 
GROUP BY groupname, channel, channelgroup 
ORDER BY channelgroup;
```

## Next Steps

1. **Database Migration**: Run the ALTER TABLE statements to add the `channelgroup` columns
2. **Data Population**: Populate the `channelgroup` field with appropriate values for each channel
3. **Testing**: Use the test page at `/channel-groups` to verify functionality
4. **Integration**: Update existing components to utilize the new channel group information

## Files Modified/Created

### Modified Files:
- `src/lib/schema.ts` - Added channelgroup field
- `drizzle/schema.ts` - Added channelgroup field  
- `src/app/api/mentions/route.js` - Added channel group query
- `src/hooks/useRTMQueries.js` - Added channel group fields to processed data

### New Files:
- `src/app/api/channel-groups/route.js` - Channel groups API endpoint
- `src/hooks/useChannelGroupsData.js` - React hooks for channel group data
- `src/components/ChannelGroupsTable.jsx` - Channel groups display component
- `src/app/channel-groups/page.jsx` - Test page for channel groups
- `check_channelgroup.js` - Database validation script

The implementation is now ready for the database migration and data population phase.