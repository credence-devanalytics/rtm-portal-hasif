# Dashboard Chart Creation Template

Based on the analysis of the dashboard structure, here's a comprehensive template prompt for creating new dashboard charts:

## Template Prompt for AI Chart Generation

```
I want you to create a dashboard chart component following the established pattern in my Next.js dashboard application. 

### Requirements:

1. **Chart Type**: [Specify: Bar Chart, Line Chart, Pie Chart, Area Chart, etc.]
2. **Data Source**: [Describe the data structure and API endpoint needed]
3. **Interactive Features**: 
   - Cross-filtering capabilities (clickable chart elements)
   - Loading states with skeleton UI
   - Error handling with fallback data
   - Sorting and display options

### Technical Specifications:

**Framework & Libraries:**
- Next.js 14 with App Router
- React with hooks (useState, useCallback, useMemo)
- Recharts for visualization
- TanStack Query for data fetching
- Tailwind CSS + shadcn/ui components
- Drizzle ORM for database queries

**File Structure to Create:**
1. **API Route**: `src/app/api/[endpoint-name]/route.js`
2. **Component**: `src/components/dashboard/charts/[chart-name].jsx`
3. **Data Hook**: Add to `src/hooks/useQueries.js`
4. **Integration**: Update main dashboard page

**Component Structure:**
```jsx
const ChartComponent = ({ 
  data, 
  onChartClick, 
  activeFilters, 
  isLoading 
}) => {
  // State management for chart interactions
  const [sortBy, setSortBy] = useState("default");
  const [showCount, setShowCount] = useState(10);

  // Data processing with useMemo
  const processedData = useMemo(() => {
    // Transform and sort data
  }, [data, sortBy]);

  // Handle chart clicks for cross-filtering
  const handleChartClick = (clickData) => {
    if (onChartClick) {
      onChartClick({
        type: 'chart-type',
        // ... filter data
      });
    }
  };

  // Loading state
  if (isLoading) {
    return <SkeletonUI />;
  }

  // Empty state
  if (!processedData?.length) {
    return <EmptyState />;
  }

  // Main chart render
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chart Title</CardTitle>
        <Controls /> {/* Sort, filter controls */}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer>
          <ChartType data={processedData}>
            {/* Chart configuration */}
          </ChartType>
        </ResponsiveContainer>
        <SummaryStats /> {/* Bottom statistics */}
      </CardContent>
    </Card>
  );
};
```

**API Route Pattern:**
```javascript
// Helper function for WHERE conditions
const buildWhereConditions = (filters) => {
  // Build dynamic SQL conditions
};

export async function GET(request) {
  try {
    // Extract and process filters
    const filters = extractFilters(searchParams);
    
    // Database query with Drizzle ORM
    const results = await db
      .select({
        // Define select fields
      })
      .from(table)
      .where(and(...conditions))
      .groupBy(groupingFields)
      .orderBy(orderFields);

    // Process and structure data
    const processedData = transformData(results);

    return NextResponse.json({
      success: true,
      data: processedData,
      meta: {
        filters,
        queryTime: new Date().toISOString(),
        dataSource: 'database',
        // ... metadata
      }
    });

  } catch (dbError) {
    // Fallback data for offline mode
    return NextResponse.json({
      success: true,
      data: fallbackData,
      meta: { dataSource: 'fallback' }
    });
  }
}
```

**Data Hook Pattern:**
```javascript
// In useQueries.js
export const useChartData = (filters, options = {}) => {
  return useQuery({
    queryKey: ['chartData', filters],
    queryFn: () => fetchChartData(filters),
    enabled: !!filters,
    staleTime: 0,
    cacheTime: 2 * 60 * 1000,
    ...options,
  });
};
```

### Specific Chart Request:

**What I want:**
[Describe your specific chart requirements here, for example:]
- "A horizontal bar chart showing top 10 users by engagement"
- "A line chart showing sentiment trends over time by platform"
- "A donut chart showing content type distribution"

**Data Fields:**
[Specify the database fields/columns to use:]
- Primary dimension: [field name]
- Metrics: [field names]
- Grouping: [field names]
- Filters needed: [field names]

**Interactions:**
[Specify desired interactions:]
- Click on bars to filter by [dimension]
- Hover to show [detailed information]
- Sort by [options]
- Show top N items with dropdown

**Styling:**
[Specify visual preferences:]
- Color scheme: [colors or theme]
- Chart size: [dimensions]
- Legend position: [top/bottom/right]
- Custom tooltip format: [description]

Please create all the necessary files following this pattern and ensure proper integration with the existing dashboard filtering system.
```

## Example Usage:

Here's how you would use this template to request a new chart:

**Sample Request:**
"Using the template above, create a pie chart showing the distribution of mention types (Post, Comment, Share, Like) with the ability to filter by platform and date range. Use the 'mention_type' column from the mentionsClassifyPublic table, group by type, and allow clicking on pie slices to filter the entire dashboard by that mention type."

This template ensures consistency with your existing dashboard architecture while providing clear guidance for AI assistants to create properly integrated components.