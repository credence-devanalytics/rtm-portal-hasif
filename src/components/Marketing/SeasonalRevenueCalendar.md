# SeasonalRevenueCalendar Component

## Overview
The SeasonalRevenueCalendar component displays a 12-month heatmap showing seasonal revenue patterns for marketing channels. This component corresponds to **Chart 5** from the Marketing Dashboard Storytelling Guide.

## Features
- **12-Month Calendar Grid**: Visual heatmap showing monthly revenue performance
- **Color-Coded Intensity**: Blue (low) → Green (average) → Yellow → Orange → Red (peak)
- **Peak Month Highlighting**: April and October are highlighted as peak performance months
- **Low Month Identification**: February is marked as the seasonal low point
- **Interactive Tooltips**: Detailed breakdown including:
  - Total revenue by month
  - Channel performance (TV, Radio, BES)
  - Year-over-year growth percentages
  - Forecast accuracy indicators
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens

## Props Interface

```typescript
interface SeasonalRevenueCalendarProps {
  data?: SeasonalCalendarData;
  isLoading?: boolean;
  error?: string;
}
```

### Data Structure

```typescript
interface SeasonalMonthData {
  month: string;
  monthIndex: number;
  totalRevenue: number;
  channels: {
    TV: number;
    RADIO: number;
    BES: number;
  };
  yearOverYearGrowth: number;
  isPeakMonth: boolean;
  isLowMonth: boolean;
  forecastAccuracy: number;
}

interface SeasonalCalendarData {
  months: SeasonalMonthData[];
  metadata: {
    year: number;
    currency: string;
    averageMonthlyRevenue: number;
    peakMonths: string[];
    lowMonths: string[];
  };
}
```

## Usage

```tsx
import SeasonalRevenueCalendar from '@/components/Marketing/SeasonalRevenueCalendar';

// Basic usage with mock data
<SeasonalRevenueCalendar />

// With custom data
<SeasonalRevenueCalendar
  data={customSeasonalData}
  isLoading={false}
  error={null}
/>

// Loading state
<SeasonalRevenueCalendar isLoading={true} />

// Error state
<SeasonalRevenueCalendar error="Failed to load data" />
```

## Key Talking Points for Presentations

Based on the marketing dashboard storytelling guide:

### **"Seasonal Intelligence"**
- "April and October consistently drive our strongest performance, representing peak advertising seasons"
- "February remains our seasonal low point, requiring targeted marketing initiatives"
- "Understanding these patterns allows us to optimize resource allocation and sales team focus"

### **Visual Elements**
- 12-month heat map calendar with intensity coloring
- Peak months (April, October) highlighted
- Forecast overlay showing predicted seasonal patterns

### **Audience Questions to Anticipate**
- "How can we improve February performance?" → Seasonal campaigns, new product launches
- "Are these patterns consistent across channels?" → Yes, with slight variations by platform

## Design System Integration
- Uses existing UI components (Card, Tooltip)
- Follows Tailwind CSS styling patterns
- Matches color scheme of other marketing charts
- Responsive grid layout (3 columns on mobile, 4 on desktop)

## Mock Data Patterns
The component includes realistic mock data with:
- **Peak Months**: April (+25%), October (+25%)
- **Low Month**: February (-20%)
- **Holiday Season**: December (+15%)
- **Summer Slowdown**: July, August (-10%)
- **Channel Breakdown**: TV (56%), Radio (38%), BES (6%)

## Development Notes
- Component is fully self-contained with mock data
- TypeScript interfaces provided for type safety
- Loading and error states implemented
- Accessibility features included (ARIA labels, keyboard navigation)
- Currency formatting for Malaysian Ringgit (MYR)