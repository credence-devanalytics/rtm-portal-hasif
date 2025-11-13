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
} from "recharts";
import { TrendingUp, Calendar, Filter, Search } from "lucide-react";

// Color palette for different channels
const CHANNEL_COLORS = [
  "#4E5899", // Primary blue
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#FFE66D", // Yellow
  "#95E1D3", // Mint
  "#F38181", // Pink
  "#AA96DA", // Purple
  "#FCBAD3", // Light pink
  "#A8E6CF", // Light green
  "#FFD3B6", // Peach
  "#FF8B94", // Coral
  "#C7CEEA", // Light purple
];

const PlatformMentionsChart = ({
  data = [],
  authorsData = [],
  channelsData = [],
  dailyChannelData = [], // New prop for daily channel breakdown
  hasActiveFilters = false,
  activeFilters = {},
  onFilterChange,
}) => {
  const [chartType, setChartType] = useState<"horizontal">("horizontal"); // Horizontal bar chart only
  const [showTop, setShowTop] = useState(10); // Show top N channels
  const [searchQuery, setSearchQuery] = useState(""); // Search query for filtering channels

  // Process the daily channel data to get top channels by total posts
  const processedData = useMemo(() => {
    // Check if channel filter is active (for cross-filtering)
    const hasChannelFilter =
      (activeFilters as any)?.channel && (activeFilters as any).channel !== "";

    // Check if platform/unit filter is active (to show only channels from that platform/unit)
    const hasPlatformFilter =
      (activeFilters as any)?.platform &&
      (activeFilters as any).platform !== "";
    const hasUnitFilter =
      (activeFilters as any)?.unit && (activeFilters as any).unit !== "";

    console.log("🔍 PlatformMentionsChart - Processing data:", {
      hasUnitFilter,
      unitFilter: (activeFilters as any)?.unit,
      hasPlatformFilter,
      platformFilter: (activeFilters as any)?.platform,
      dailyChannelDataLength: dailyChannelData?.length,
      sampleItem: dailyChannelData?.[0],
    });

    // Use API data if available
    if (dailyChannelData && dailyChannelData.length > 0) {
      // Filter by platform/unit first if filter is active
      let filteredChannelData = dailyChannelData;

      if (hasPlatformFilter || hasUnitFilter) {
        const targetPlatform = (
          (activeFilters as any).platform || ""
        ).toLowerCase();
        const rawTargetUnit = ((activeFilters as any).unit || "").toLowerCase();

        // Map frontend unit filter to database CASE values
        const targetUnit =
          rawTargetUnit === "berita" || rawTargetUnit === "news"
            ? "news"
            : rawTargetUnit;

        console.log("📊 Filtering channels:", {
          targetPlatform,
          rawTargetUnit,
          targetUnit,
          beforeFilterCount: dailyChannelData.length,
        });

        filteredChannelData = dailyChannelData.filter((item: any) => {
          // Check both platform and unit fields for compatibility
          const itemPlatform = (item.platform || "").toLowerCase();
          const itemUnit = (item.unit || "").toLowerCase();

          // If BOTH filters are active, BOTH must match
          if (hasPlatformFilter && hasUnitFilter) {
            return itemPlatform === targetPlatform && itemUnit === targetUnit;
          }

          // If ONLY platform filter is active
          if (hasPlatformFilter && !hasUnitFilter) {
            return itemPlatform === targetPlatform;
          }

          // If ONLY unit filter is active
          if (hasUnitFilter && !hasPlatformFilter) {
            return itemUnit === targetUnit;
          }

          return true;
        });

        console.log("✅ After filtering:", {
          afterFilterCount: filteredChannelData.length,
          sampleFilteredItem: filteredChannelData[0],
        });
      }

      // Get total posts per channel
      const channelTotals = filteredChannelData.reduce((acc, item) => {
        const channelName = item.channel || "Unknown";
        // Skip N/A and Unknown entries
        if (channelName === "N/A" || channelName === "Unknown") {
          return acc;
        }
        const itemCount = Number(item.count);
        acc[channelName] = (acc[channelName] || 0) + itemCount;
        return acc;
      }, {} as Record<string, number>);

      // Calculate grand total (all channels, all posts in filtered data)
      const grandTotal = Object.values(channelTotals).reduce(
        (sum: number, count) => sum + Number(count),
        0
      );

      // Sort all channels by total first
      let allChannels = Object.entries(channelTotals)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([channel, total]) => ({
          channel,
          posts: total,
        }));

      // Apply search filter BEFORE limiting to top N (ILIKE %pattern% style)
      if (searchQuery.trim()) {
        const searchPattern = searchQuery.toLowerCase();
        allChannels = allChannels.filter((item) =>
          item.channel.toLowerCase().includes(searchPattern)
        );
      }

      // Now apply top N limit AFTER search filtering
      let topChannels = allChannels.slice(0, showTop);

      // If channel filter is active, only show that channel
      if (hasChannelFilter) {
        const targetChannel = (activeFilters as any).channel;
        topChannels = topChannels.filter(
          (item) => item.channel === targetChannel
        );
      }

      return {
        data: topChannels,
        channels: topChannels.map((c) => c.channel),
        grandTotal, // Include grand total for display
      };
    }

    // Fallback: process from raw filtered data
    if (!data || data.length === 0) {
      return { data: [], channels: [], grandTotal: 0 };
    }

    // Filter by platform/unit if needed
    let filteredData = data;
    if (hasPlatformFilter || hasUnitFilter) {
      const targetPlatform = (
        (activeFilters as any).platform || ""
      ).toLowerCase();
      const targetUnit = ((activeFilters as any).unit || "").toLowerCase();

      filteredData = data.filter((item: any) => {
        const itemPlatform = (item.platform || "").toLowerCase();
        const itemUnit = (item.unit || "").toLowerCase();

        if (hasPlatformFilter && itemPlatform === targetPlatform) return true;
        if (hasUnitFilter && itemUnit === targetUnit) return true;

        return false;
      });
    }

    // Count by channel
    const channelTotals: Record<string, number> = {};
    filteredData.forEach((item) => {
      if (!item.channel) return;
      // Skip N/A and Unknown entries
      if (item.channel === "N/A" || item.channel === "Unknown") return;
      channelTotals[item.channel] = (channelTotals[item.channel] || 0) + 1;
    });

    // Calculate grand total
    const grandTotal = Object.values(channelTotals).reduce(
      (sum, count) => sum + count,
      0
    );

    // Sort all channels by total first
    let allChannels = Object.entries(channelTotals)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([channel, total]) => ({
        channel,
        posts: total,
      }));

    // Apply search filter BEFORE limiting to top N (ILIKE %pattern% style)
    if (searchQuery.trim()) {
      const searchPattern = searchQuery.toLowerCase();
      allChannels = allChannels.filter((item) =>
        item.channel.toLowerCase().includes(searchPattern)
      );
    }

    // Now apply top N limit AFTER search filtering
    let topChannels = allChannels.slice(0, showTop);

    // Filter by channel if needed
    if (hasChannelFilter) {
      const targetChannel = (activeFilters as any).channel;
      topChannels = topChannels.filter(
        (item) => item.channel === targetChannel
      );
    }

    return {
      data: topChannels,
      channels: topChannels.map((c) => c.channel),
      grandTotal,
    };
  }, [data, dailyChannelData, activeFilters, showTop, searchQuery]);

  const { data: chartData, channels, grandTotal } = processedData;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-800 text-sm mb-1">{label}</p>
          <p className="text-xs text-gray-600">
            <span className="font-semibold">
              {payload[0].value.toLocaleString()}
            </span>{" "}
            posts
          </p>
        </div>
      );
    }
    return null;
  };

  // Handle bar click for cross-filtering
  const handleBarClick = (data: any) => {
    if (onFilterChange && data?.channel) {
      onFilterChange("channel", data.channel);
    }
  };

  // Custom YAxis tick that is clickable
  const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const channel = payload.value;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={4}
          textAnchor="end"
          fill="#666"
          fontSize={11}
          onClick={() => {
            if (onFilterChange && channel) {
              onFilterChange("channel", channel);
            }
          }}
          style={{
            cursor: onFilterChange ? "pointer" : "default",
            userSelect: "none",
          }}
          className={onFilterChange ? "hover:fill-blue-600 hover:font-semibold transition-all" : ""}
        >
          {channel}
        </text>
      </g>
    );
  };

  // Loading state
  if (!data && !dailyChannelData) {
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

  // Check if we have search query active
  const hasSearchQuery = searchQuery.trim() !== "";

  // Empty state - differentiate between no data and no search results
  const hasNoData =
    !chartData || chartData.length === 0 || !channels || channels.length === 0;

  return (
    <div className="bg-white h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 shrink-0">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] font-bold text-gray-900 flex items-center">
              Top Channels by Posts
            </h2>
            <span className="text-xs text-gray-500">
              {(grandTotal || 0).toLocaleString()} total
            </span>
          </div>

          {/* Active filters display */}
          {((activeFilters as any)?.platform ||
            (activeFilters as any)?.unit ||
            (activeFilters as any)?.channel) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-600">Filtered by:</span>
              {(activeFilters as any)?.platform && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs font-medium">
                  Platform: {(activeFilters as any).platform}
                </span>
              )}
              {(activeFilters as any)?.unit && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
                  Unit: {(activeFilters as any).unit}
                </span>
              )}
              {(activeFilters as any)?.channel && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                  Channel: {(activeFilters as any).channel}
                </span>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex space-x-2">
            {/* Search bar */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Top N selector */}
            <select
              value={showTop}
              onChange={(e) => setShowTop(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>Top 5 Channels</option>
              <option value={10}>Top 10 Channels</option>
              <option value={15}>Top 15 Channels</option>
              <option value={20}>Top 20 Channels</option>
              <option value={999999}>All Channels</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-3 min-h-0">
        {hasNoData ? (
          // Show empty state message but keep the container
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Search className="h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              {hasSearchQuery ? "No Matching Channels" : "No Data Available"}
            </h3>
            <p className="text-xs text-gray-500 max-w-xs">
              {hasSearchQuery
                ? `No channels found matching "${searchQuery}". Try adjusting your search.`
                : "No channel posts data found for the selected period."}
            </p>
            {hasSearchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div style={{ width: "100%", height: 450 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
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
                />
                <YAxis
                  type="category"
                  dataKey="channel"
                  stroke="#666"
                  tick={<CustomYAxisTick />}
                  width={100}
                  tickLine={{ stroke: "#666" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="posts"
                  radius={[0, 4, 4, 0]}
                  onClick={handleBarClick}
                  cursor={onFilterChange ? "pointer" : "default"}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Clickable hint */}
      {onFilterChange && !hasNoData && (
        <div className="px-3 pb-2 shrink-0">
          <p className="text-xs text-gray-400 italic text-center">
            💡 Click on channel names or bars to filter by channel
          </p>
        </div>
      )}
    </div>
  );
};

export default PlatformMentionsChart;
