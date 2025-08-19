import React, { useState, useMemo } from "react";
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

const EngagementRateChart = ({ data = [], onFilterChange }) => {
  const [activeFilters, setActiveFilters] = useState([]);
  const [hoveredPlatform, setHoveredPlatform] = useState(null);

  // Platform colors mapping
  const platformColors = {
    Facebook: "#1877F2",
    Instagram: "#E4405F",
    Twitter: "#1DA1F2",
    TikTok: "#000000",
    YouTube: "#FF0000",
    LinkedIn: "#0A66C2",
    Reddit: "#FF4500",
    Web: "#6B7280",
    Unknown: "#6B7280",
    Other: "#9CA3AF",
  };

  // Memoized data processing for performance
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

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
      .map((group) => ({
        platform: group.platform,
        avgEngagementRate: Number(
          (group.totalEngagement / group.count).toFixed(2)
        ),
        mentionCount: group.totalMentions,
        totalReach: group.totalReach,
        totalInteractions: group.totalInteractions,
        color: platformColors[group.platform] || platformColors.Other,
      }))
      .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate); // Sort by engagement rate descending

    return result;
  }, [data]);

  // Handle platform click for filtering
  const handlePlatformClick = (platformData) => {
    if (!onFilterChange) return;

    const platform = platformData.platform;
    const isActive = activeFilters.includes(platform);

    let newFilters;
    if (isActive) {
      // Remove filter
      newFilters = activeFilters.filter((f) => f !== platform);
    } else {
      // Add filter
      newFilters = [...activeFilters, platform];
    }

    setActiveFilters(newFilters);

    // Trigger parent filter change
    onFilterChange({
      type: "platform",
      value: newFilters,
      action: isActive ? "remove" : "add",
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters([]);
    if (onFilterChange) {
      onFilterChange({
        type: "platform",
        value: [],
        action: "clear",
      });
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
              {data.avgEngagementRate}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Mentions:</span>
            <span className="font-medium text-gray-900">
              {data.mentionCount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Reach:</span>
            <span className="font-medium text-gray-900">
              {data.totalReach.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Interactions:</span>
            <span className="font-medium text-gray-900">
              {data.totalInteractions.toLocaleString()}
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
            <Tooltip content={<CustomTooltip />} />
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
                    backgroundColor:
                      platformColors[filter] || platformColors.Other,
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {processedData
                .reduce((sum, item) => sum + item.mentionCount, 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Mentions</div>
          </div>
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
