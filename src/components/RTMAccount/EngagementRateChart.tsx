import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, Filter, X, BarChart3 } from "lucide-react";

interface EngagementRateChartProps {
  data?: any[];
  platformsData?: any[];
  platformByUnitData?: any[];
  activeFilters?: {
    platform?: string | null;
    unit?: string | null;
    [key: string]: any;
  };
  onFilterChange?: (filterType: string, value: any) => void;
}

const EngagementRateChart: React.FC<EngagementRateChartProps> = ({
  data = [], // client-side filtered data (usually empty)
  platformsData, // API aggregated data
  platformByUnitData, // API aggregated by unit
  activeFilters = {}, // globalFilters from parent
  onFilterChange,
}) => {
  // Helper: Case-insensitive platform filter
  const isPlatformFiltered = (platform: string) => {
    if (!activeFilters || !activeFilters.platform) return false;
    return (
      platform?.toLowerCase() === (activeFilters.platform ?? "").toLowerCase()
    );
  };

  // Platform colors mapping with official brand colors
  const platformColors = {
    Facebook: "#1877F2", // Facebook blue
    Instagram: "#E4405F", // Instagram gradient pink
    Twitter: "#1DA1F2", // Twitter blue (X)
    TikTok: "#000000", // TikTok black
    YouTube: "#FF0000", // YouTube red
    LinkedIn: "#0A66C2", // LinkedIn blue
    Reddit: "#FF4500", // Reddit orange-red
    Web: "#94A3B8", // Green for web
    Other: "#94A3B8", // Slate gray
    Unknown: "#64748B", // Darker slate
  };

  // Helper to get color with case-insensitive lookup
  const getColorForPlatform = (platform: string) => {
    if (!platform) return platformColors.Other;
    const key = Object.keys(platformColors).find(
      (k) => k.toLowerCase() === platform.toLowerCase()
    );
    return key ? platformColors[key] : platformColors.Other;
  };

  // Always use API data (platformsData or platformByUnitData)
  const processedData = useMemo(() => {
    // Use platformByUnitData if unit filter is active and available
    if (
      activeFilters &&
      activeFilters.unit &&
      activeFilters.unit !== "overall" &&
      platformByUnitData &&
      platformByUnitData.length > 0
    ) {
      let unitName = activeFilters.unit ?? "";
      if (unitName === "berita") unitName = "News";
      else if (unitName === "radio") unitName = "Radio";
      else if (unitName === "tv") unitName = "TV";
      else if (unitName === "official") unitName = "Official";
      const filtered = platformByUnitData.filter(
        (p) => (p.unit ?? "").toLowerCase() === unitName.toLowerCase()
      );
      return filtered
        .map((p) => ({
          platform: p.platform,
          avgEngagementRate: Number(p.avgEngagementRate?.toFixed(2)) || 0,
          mentionCount: p.count,
          totalReach: p.totalReach,
          totalInteractions: p.totalInteractions,
          color: getColorForPlatform(p.platform),
        }))
        .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);
    }
    // Use platformsData from API (already filtered)
    if (platformsData && platformsData.length > 0) {
      console.log("✅ Using API data (respects all filters):", platformsData);
      return platformsData
        .map((p) => ({
          platform: p.platform,
          avgEngagementRate: Number(
            (p.avgEngagementRate || p.engagement_rate_pct || 0).toFixed(2)
          ),
          mentionCount: p.count || p.mentions_count || 0,
          totalReach: p.totalReach || p.total_reach || 0,
          totalInteractions: p.totalInteractions || p.total_interactions || 0,
          color: getColorForPlatform(p.platform),
        }))
        .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);
    }
    // Fallback: empty
    return [];
  }, [platformsData, platformByUnitData, activeFilters]);

  // Click handler for cross-filtering
  const handlePlatformClick = (platform) => {
    if (!onFilterChange) return;
    if (!platform) return;
    // Toggle: clicking same platform clears filter
    const isSame =
      activeFilters?.platform?.toLowerCase() === platform?.toLowerCase();
    const newValue = isSame ? null : platform;
    console.log("🖱️ Clicked platform:", platform);
    console.log("   Current filter:", activeFilters?.platform);
    onFilterChange("platform", newValue);
  };
  // Clear all filters
  const clearFilters = () => {
    if (onFilterChange) {
      onFilterChange("platform", null);
    }
  };

  // Custom tooltip with filter hint
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload[0]) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 max-w-xs border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-semibold text-gray-900">{label}</span>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Avg. Engagement Rate:</span>
            <span className="font-medium text-gray-900">
              {data.avgEngagementRate || 0}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Mentions:</span>
            <span className="font-medium text-gray-900">
              {(data.mentionCount || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Reach:</span>
            <span className="font-medium text-gray-900">
              {(data.totalReach || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Interactions:</span>
            <span className="font-medium text-gray-900">
              {(data.totalInteractions || 0).toLocaleString()}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 italic">
          Click a bar to filter by platform
        </p>
      </div>
    );
  };

  // Loading state
  if (!platformsData && !platformByUnitData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  // Empty state
  if (processedData.length === 0) {
    const isChannelFiltered = !!activeFilters?.channel;
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center h-64 text-gray-500">
        <BarChart3 className="w-12 h-12 mb-2 opacity-40" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Engagement Rate by Platform
        </h3>
        <p className="text-lg font-medium">
          {isChannelFiltered
            ? `No engagement data available for "${activeFilters.channel}"`
            : "No engagement data available"}
        </p>
        <p className="text-sm mb-2">
          {isChannelFiltered
            ? "Try clearing the channel filter to see all platforms."
            : "Data will appear here when mentions are loaded."}
        </p>
        {isChannelFiltered && (
          <button
            onClick={() => onFilterChange && onFilterChange("channel", null)}
            className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors text-xs font-medium"
          >
            Clear Channel Filter
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Engagement Rate by Platform
          </h2>
          <p className="text-gray-600">
            Engagement rate is the percentage of people who saw the post and
            interacted with it
          </p>
        </div>
        {/* Filter controls */}
        {activeFilters?.platform && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">1 active</span>
            </div>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          </div>
        )}
      </div>
      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="platform"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              label={{
                value: "Engagement Rate (%)",
                angle: -90,
                position: "insideLeft",
                style: {
                  textAnchor: "middle",
                  fill: "#6b7280",
                  fontSize: "12px",
                },
              }}
            />
            <Tooltip content={CustomTooltip} />
            <Bar
              dataKey="avgEngagementRate"
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onClick={(data, index) => handlePlatformClick(data.platform)}
            >
              {processedData.map((entry, index) => {
                const isFiltered = isPlatformFiltered(entry.platform);
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    fillOpacity={
                      activeFilters?.platform ? (isFiltered ? 1 : 0.3) : 0.8
                    }
                    stroke={isFiltered ? entry.color : "transparent"}
                    strokeWidth={isFiltered ? 2 : 0}
                    className="hover:opacity-80 transition-all duration-200"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Active filters display */}
      {activeFilters?.platform && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filter:</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: getColorForPlatform(activeFilters.platform),
                }}
              />
              {activeFilters.platform}
              <button
                onClick={() => handlePlatformClick(activeFilters.platform)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        </div>
      )}
      {/* Summary stats */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {processedData.length}
            </div>
            <div className="text-sm text-gray-600">Platforms</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {processedData.length > 0
                ? (
                    processedData.reduce(
                      (sum, item) => sum + item.avgEngagementRate,
                      0
                    ) / processedData.length
                  ).toFixed(1)
                : 0}
              %
            </div>
            <div className="text-sm text-gray-600">Avg. Engagement</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {processedData.length > 0 ? processedData[0].platform : "N/A"}
            </div>
            <div className="text-sm text-gray-600">Top Platform</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementRateChart;
