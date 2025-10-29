import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Activity } from "lucide-react";

// Color palette for different platforms
const PLATFORM_COLORS: Record<string, string> = {
  Facebook: "#1877F2",
  Instagram: "#E4405F",
  Twitter: "#1DA1F2",
  TikTok: "#000000",
  YouTube: "#FF0000",
  LinkedIn: "#0A66C2",
  Unknown: "#9CA3AF",
  Online: "#10B981",
  Print: "#6B7280",
  Broadcast: "#8B5CF6",
};

const DEFAULT_COLOR = "#4E5899";

interface EngagementData {
  platform: string;
  engagement_rate_pct: number;
  total_interactions: number;
  total_reach: number;
  mentions_count: number;
}

interface EngagementRateByPlatformChartProps {
  data?: EngagementData[];
  hasActiveFilters?: boolean;
  activeFilters?: any;
  onFilterChange?: (filterKey: string, value: string) => void;
}

const EngagementRateByPlatformChart: React.FC<
  EngagementRateByPlatformChartProps
> = ({
  data = [],
  hasActiveFilters = false,
  activeFilters = {},
  onFilterChange,
}) => {
  const [showTop, setShowTop] = useState(10);
  const [sortBy, setSortBy] = useState<"engagement" | "interactions" | "reach">(
    "engagement"
  );

  // Process and sort data
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Filter by platform if active
    let filtered = [...data];
    if (activeFilters?.platform) {
      filtered = filtered.filter(
        (item) => item.platform === activeFilters.platform
      );
    }

    // Sort based on selected criteria
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "engagement":
          return (b.engagement_rate_pct || 0) - (a.engagement_rate_pct || 0);
        case "interactions":
          return (b.total_interactions || 0) - (a.total_interactions || 0);
        case "reach":
          return (b.total_reach || 0) - (a.total_reach || 0);
        default:
          return 0;
      }
    });

    // Get top N
    return filtered.slice(0, showTop);
  }, [data, activeFilters, sortBy, showTop]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalInteractions = processedData.reduce(
      (sum, item) => sum + (Number(item.total_interactions) || 0),
      0
    );
    const totalReach = processedData.reduce(
      (sum, item) => sum + (Number(item.total_reach) || 0),
      0
    );
    const avgEngagement =
      totalReach > 0 ? (totalInteractions / totalReach) * 100 : 0;
    const totalMentions = processedData.reduce(
      (sum, item) => sum + (Number(item.mentions_count) || 0),
      0
    );

    return {
      totalInteractions,
      totalReach,
      avgEngagement,
      totalMentions,
    };
  }, [processedData]);

  // Get platform color
  const getPlatformColor = (platform: string) => {
    return PLATFORM_COLORS[platform] || DEFAULT_COLOR;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
          <p className="font-semibold text-gray-800 text-sm mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-xs text-gray-600">
              <span className="font-semibold text-blue-600">
                {Number(data.engagement_rate_pct).toFixed(2)}%
              </span>{" "}
              Engagement Rate
            </p>
            <p className="text-xs text-gray-600">
              <span className="font-semibold">
                {Number(data.total_interactions).toLocaleString()}
              </span>{" "}
              Interactions
            </p>
            <p className="text-xs text-gray-600">
              <span className="font-semibold">
                {Number(data.total_reach).toLocaleString()}
              </span>{" "}
              Reach
            </p>
            <p className="text-xs text-gray-600">
              <span className="font-semibold">
                {Number(data.mentions_count).toLocaleString()}
              </span>{" "}
              Mentions
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle bar click for cross-filtering
  const handleBarClick = (data: any) => {
    if (onFilterChange && data?.platform) {
      onFilterChange("platform", data.platform);
    }
  };

  // Loading state
  if (!data) {
    return (
      <div className="h-full">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!processedData || processedData.length === 0) {
    return (
      <div className="bg-white h-full flex flex-col items-center justify-center p-4 text-center">
        <Activity className="h-8 w-8 text-gray-400 mb-2" />
        <h3 className="text-sm font-medium text-gray-900 mb-1">
          No Data Available
        </h3>
        <p className="text-xs text-gray-500">
          No engagement data found for the selected period.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 shrink-0">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] font-bold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Engagement Rate by Platform
            </h2>
            <div className="text-right">
              <div className="text-xs text-gray-500">Avg Engagement</div>
              <div className="text-sm font-bold text-blue-600">
                {totals.avgEngagement.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-xs text-gray-500">Total Interactions</div>
              <div className="text-sm font-semibold text-gray-800">
                {totals.totalInteractions.toLocaleString()}
              </div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-xs text-gray-500">Total Reach</div>
              <div className="text-sm font-semibold text-gray-800">
                {totals.totalReach.toLocaleString()}
              </div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-xs text-gray-500">Total Mentions</div>
              <div className="text-sm font-semibold text-gray-800">
                {totals.totalMentions.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "engagement" | "interactions" | "reach"
                )
              }
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="engagement">Sort by Engagement Rate</option>
              <option value="interactions">Sort by Interactions</option>
              <option value="reach">Sort by Reach</option>
            </select>
            <select
              value={showTop}
              onChange={(e) => setShowTop(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={15}>Top 15</option>
              <option value={20}>All Platforms</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-3 min-h-0">
        <div style={{ width: "100%", height: 450 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              layout="vertical"
              margin={{ top: 20, right: 30, bottom: 20, left: 80 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                stroke="#666"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: "#666" }}
                label={{
                  value: "Engagement Rate (%)",
                  position: "insideBottom",
                  offset: -10,
                  style: { fontSize: 12, fill: "#666" },
                }}
              />
              <YAxis
                type="category"
                dataKey="platform"
                stroke="#666"
                tick={{ fontSize: 11 }}
                width={70}
                tickLine={{ stroke: "#666" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="engagement_rate_pct"
                radius={[0, 4, 4, 0]}
                onClick={handleBarClick}
                cursor={onFilterChange ? "pointer" : "default"}
              >
                {processedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getPlatformColor(entry.platform)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Clickable hint */}
      {onFilterChange && (
        <div className="px-3 pb-2 shrink-0">
          <p className="text-xs text-gray-400 italic text-center">
            💡 Click on bars to filter by platform
          </p>
        </div>
      )}
    </div>
  );
};

export default EngagementRateByPlatformChart;
