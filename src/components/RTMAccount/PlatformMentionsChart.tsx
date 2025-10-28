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
import { TrendingUp, Calendar, Filter } from "lucide-react";

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

  // Process the daily channel data to get top channels by total posts
  const processedData = useMemo(() => {
    // Check if author/channel filter is active (for cross-filtering)
    const hasAuthorFilter =
      (activeFilters as any)?.author && (activeFilters as any).author !== "";

    // Use API data if available
    if (dailyChannelData && dailyChannelData.length > 0) {
      // Get total posts per channel
      const channelTotals = dailyChannelData.reduce((acc, item) => {
        const channelName = item.channel || "Unknown";
        const itemCount = Number(item.count);
        acc[channelName] = (acc[channelName] || 0) + itemCount;
        return acc;
      }, {} as Record<string, number>);

      // Sort by total and get top N
      let topChannels = Object.entries(channelTotals)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, showTop)
        .map(([channel, total]) => ({
          channel,
          posts: total,
        }));

      // If author filter is active, only show that channel
      if (hasAuthorFilter) {
        const targetAuthor = (activeFilters as any).author;
        topChannels = topChannels.filter(
          (item) => item.channel === targetAuthor
        );
      }

      return { data: topChannels, channels: topChannels.map((c) => c.channel) };
    }

    // Fallback: process from raw filtered data
    if (!data || data.length === 0) {
      return { data: [], channels: [] };
    }

    // Count by channel
    const channelTotals: Record<string, number> = {};
    data.forEach((item) => {
      if (!item.channel) return;
      channelTotals[item.channel] = (channelTotals[item.channel] || 0) + 1;
    });

    // Get top channels
    let topChannels = Object.entries(channelTotals)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, showTop)
      .map(([channel, total]) => ({
        channel,
        posts: total,
      }));

    // Filter by author if needed
    if (hasAuthorFilter) {
      const targetAuthor = (activeFilters as any).author;
      topChannels = topChannels.filter((item) => item.channel === targetAuthor);
    }

    return { data: topChannels, channels: topChannels.map((c) => c.channel) };
  }, [data, dailyChannelData, activeFilters, showTop]);

  const { data: chartData, channels } = processedData;

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
      onFilterChange("author", data.channel);
    }
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

  // Empty state
  if (
    !chartData ||
    chartData.length === 0 ||
    !channels ||
    channels.length === 0
  ) {
    return (
      <div className="bg-white h-full flex flex-col items-center justify-center p-4 text-center">
        <Calendar className="h-8 w-8 text-gray-400 mb-2" />
        <h3 className="text-sm font-medium text-gray-900 mb-1">
          No Data Available
        </h3>
        <p className="text-xs text-gray-500">
          No channel posts data found for the selected period.
        </p>
      </div>
    );
  }

  const totalMentions = chartData.reduce(
    (sum, item) => sum + (item.posts as number),
    0
  );

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
              {totalMentions.toLocaleString()} total
            </span>
          </div>

          {/* Controls */}
          <div className="flex space-x-2">
            <select
              value={showTop}
              onChange={(e) => setShowTop(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>Top 5 Channels</option>
              <option value={10}>Top 10 Channels</option>
              <option value={15}>Top 15 Channels</option>
              <option value={20}>Top 20 Channels</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-3 min-h-0">
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
                tick={{ fontSize: 11 }}
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
      </div>

      {/* Clickable hint */}
      {onFilterChange && (
        <div className="px-3 pb-2 shrink-0">
          <p className="text-xs text-gray-400 italic text-center">
            💡 Click on bars to filter by channel
          </p>
        </div>
      )}
    </div>
  );
};

export default PlatformMentionsChart;
