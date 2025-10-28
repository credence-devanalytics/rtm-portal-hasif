import React, { useState, useMemo, useEffect } from "react";
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

const EngagementRateChart = ({
  data = [],
  platformsData,
  platformByUnitData,
  hasActiveFilters,
  activeFilters: globalFilters,
  onFilterChange,
}) => {
  const [activeFilters, setActiveFilters] = useState([]);
  const [hoveredPlatform, setHoveredPlatform] = useState(null);

  // Sync with global platform filter
  useEffect(() => {
    if (globalFilters?.platform) {
      setActiveFilters([globalFilters.platform]);
    } else {
      setActiveFilters([]);
    }
  }, [globalFilters?.platform]);

  // Platform colors mapping with official brand colors
  const platformColors = {
    Facebook: "#1877F2", // Facebook blue
    Instagram: "#E4405F", // Instagram gradient pink
    Twitter: "#1DA1F2", // Twitter blue (X)
    TikTok: "#000000", // TikTok black
    YouTube: "#FF0000", // YouTube red
    LinkedIn: "#0A66C2", // LinkedIn blue
    Reddit: "#FF4500", // Reddit orange-red
    Web: "#10B981", // Green for web
    Other: "#94A3B8", // Slate gray
    Unknown: "#64748B", // Darker slate
  };

  // Helper to get color with case-insensitive lookup
  const getColorForPlatform = (platform) => {
    if (!platform) return platformColors.Other;

    // Try exact match first
    if (platformColors[platform]) return platformColors[platform];

    // Try case-insensitive match
    const key = Object.keys(platformColors).find(
      (k) => k.toLowerCase() === platform.toLowerCase()
    );

    return key ? platformColors[key] : platformColors.Other;
  };

  // Memoized data processing for performance
  const processedData = useMemo(() => {
    // Check if unit filter is active
    const hasUnitFilter =
      globalFilters?.unit && globalFilters.unit !== "overall";
    const currentUnit = globalFilters?.unit;

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 ENGAGEMENT RATE CHART - Data Processing");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1. hasActiveFilters:", hasActiveFilters);
    console.log("2. hasUnitFilter:", hasUnitFilter);
    console.log("3. currentUnit:", currentUnit);
    console.log("4. platformByUnitData available:", !!platformByUnitData);

    // Use platformByUnitData when unit filter is active
    if (hasUnitFilter && platformByUnitData && platformByUnitData.length > 0) {
      console.log("5. Using platformByUnitData (filtered by unit in API)");

      // Map unit filter to actual unit name in data
      let unitName = currentUnit;
      if (currentUnit === "berita") unitName = "News";
      else if (currentUnit === "radio") unitName = "Radio";
      else if (currentUnit === "tv") unitName = "TV";
      else if (currentUnit === "official") unitName = "Official";

      console.log("6. Filtering for unit:", unitName);

      // Filter platformByUnitData for the selected unit
      const filtered = platformByUnitData.filter(
        (p: any) => p.unit === unitName
      );
      console.log("7. Filtered platforms:", filtered.length);
      console.log("8. Sample data:", filtered.slice(0, 3));

      const result = filtered
        .map((p: any) => ({
          platform: p.platform,
          avgEngagementRate: Number(p.avgEngagementRate?.toFixed(2)) || 0,
          mentionCount: p.count,
          totalReach: p.totalReach,
          totalInteractions: p.totalInteractions,
          color: getColorForPlatform(p.platform),
        }))
        .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);

      console.log("9. Final processed data count:", result.length);
      console.log("10. Final processed data with values:");
      result.forEach((r, i) => {
        console.log(
          `    ${i + 1}. ${r.platform}: ${r.avgEngagementRate}% (${
            r.mentionCount
          } mentions)`
        );
      });
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      return result;
    }

    // Use accurate platformsData from API ONLY when:
    // 1. No client-side filters are active (hasActiveFilters = false)
    // 2. No unit filter is active
    // 3. platformsData is available
    if (
      !hasActiveFilters &&
      !hasUnitFilter &&
      platformsData &&
      platformsData.length > 0
    ) {
      console.log(
        "5. Using accurate platformsData from API (no filters):",
        platformsData.length
      );
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      return platformsData
        .map((p: any) => ({
          platform: p.platform,
          // Handle both old field names (avgEngagementRate) and new field names (engagement_rate_pct)
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

    // Fallback to calculating from filtered data
    if (!data || data.length === 0) return [];

    console.log(
      "5. Calculating from filtered data (client-side):",
      data.length
    );
    console.log("   - This happens when client-side filters are active");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Group by platform and calculate average engagement rate
    const platformGroups = data.reduce((acc, item) => {
      if (!item || typeof item.engagementRate !== "number" || !item.platform)
        return acc;

      const platform = item.platform;
      if (!acc[platform]) {
        acc[platform] = {
          platform,
          totalEngagement: 0,
          count: 0,
          totalMentions: 0,
          totalReach: 0,
          totalInteractions: 0,
        };
      }

      acc[platform].totalEngagement += item.engagementRate;
      acc[platform].count += 1;
      acc[platform].totalMentions += 1;
      acc[platform].totalReach += item.reach || 0;
      acc[platform].totalInteractions += item.interactions || 0;

      return acc;
    }, {});

    // Convert to array and calculate averages
    const result = Object.values(platformGroups)
      .map((group: any) => ({
        platform: group.platform,
        avgEngagementRate: Number(
          (group.totalEngagement / group.count).toFixed(2)
        ),
        mentionCount: group.totalMentions,
        totalReach: group.totalReach,
        totalInteractions: group.totalInteractions,
        color: getColorForPlatform(group.platform),
      }))
      .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate); // Sort by engagement rate descending

    return result;
  }, [
    data,
    platformsData,
    platformByUnitData,
    hasActiveFilters,
    globalFilters?.unit,
  ]);

  // Handle platform click for filtering
  const handlePlatformClick = (platformData) => {
    if (!onFilterChange) return;

    const platform = platformData.platform;

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎨 ENGAGEMENT RATE CHART - Platform Click");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1. Clicked platform:", platform);
    console.log("2. Current activeFilters:", activeFilters);

    // Toggle filter behavior: clicking the same platform clears it
    const isActive = activeFilters.includes(platform);

    let newFilters;
    if (isActive) {
      // Remove filter
      newFilters = activeFilters.filter((f) => f !== platform);
      console.log("3. Action: REMOVE filter");
    } else {
      // Add filter (replace existing, not multi-select)
      newFilters = [platform]; // Only one platform at a time
      console.log("3. Action: ADD filter");
    }

    console.log("4. New activeFilters:", newFilters);
    setActiveFilters(newFilters);

    // Call parent with the correct signature: (filterType, filterValue)
    // If removing, pass the platform to toggle it off
    // If adding, pass the platform to toggle it on
    console.log("5. Calling onFilterChange('platform', '" + platform + "')");
    onFilterChange("platform", platform);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters([]);
    if (onFilterChange) {
      // Clear the platform filter by setting it to null
      onFilterChange("platform", null);
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 max-w-xs">
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
      </div>
    );
  };

  // Loading state
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0 || processedData.length === 0) {
    console.log("⚠️ EMPTY STATE TRIGGERED");
    console.log("   - data.length:", data.length);
    console.log("   - processedData.length:", processedData.length);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Engagement Rate by Platform
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <TrendingUp className="w-12 h-12 mb-2 opacity-40" />
          <p className="text-lg font-medium">No engagement data available</p>
          <p className="text-sm">
            Data will appear here when mentions are loaded
          </p>
        </div>
      </div>
    );
  }

  console.log("✅ RENDERING CHART");
  console.log("   - processedData.length:", processedData.length);
  console.log("   - processedData:", processedData);

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
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {activeFilters.length} active
              </span>
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
            onClick={handlePlatformClick}
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
            <Tooltip
              content={
                <CustomTooltip
                  active={undefined}
                  payload={undefined}
                  label={undefined}
                />
              }
            />
            <Bar
              dataKey="avgEngagementRate"
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onMouseEnter={(data) => setHoveredPlatform(data.platform)}
              onMouseLeave={() => setHoveredPlatform(null)}
            >
              {processedData.map((entry, index) => {
                const isActive = activeFilters.includes(entry.platform);
                const isHovered = hoveredPlatform === entry.platform;

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    fillOpacity={isActive ? 1 : isHovered ? 0.8 : 0.7}
                    stroke={isActive ? entry.color : "transparent"}
                    strokeWidth={isActive ? 2 : 0}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Active filters display */}
      {activeFilters.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {activeFilters.map((filter) => (
              <span
                key={filter}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: getColorForPlatform(filter),
                  }}
                />
                {filter}
                <button
                  onClick={() => handlePlatformClick({ platform: filter })}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          {/* <div>
            <div className="text-2xl font-bold text-gray-900">
              {processedData
                .reduce((sum, item) => sum + item.mentionCount, 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Mentions</div>
          </div> */}
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
