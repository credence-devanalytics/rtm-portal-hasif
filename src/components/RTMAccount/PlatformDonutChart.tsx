import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const PlatformDonutChart = ({
  data,
  platformsData, // API data for platforms
  onFilterChange,
  activeFilters = {},
}: any) => {
  console.log("🔍 PlatformDonutChart - Props received:");
  console.log("   - data:", data);
  console.log("   - data length:", data?.length);
  console.log("   - platformsData:", platformsData);
  console.log("   - platformsData length:", platformsData?.length);
  console.log("   - activeFilters:", activeFilters);
  console.log("   - onFilterChange:", typeof onFilterChange);

  // ALWAYS use platformsData from API - it automatically respects filters
  // The API handles filtering, so we don't need to switch data sources
  let platformCounts = {};

  if (platformsData && platformsData.length > 0) {
    // Use API platformsData - it already respects any active filters
    console.log("✅ Using platformsData from API (respects all filters)");
    platformCounts = platformsData.reduce((acc, item) => {
      const platform = item.platform || "Unknown";
      acc[platform] = Number(item.count);
      return acc;
    }, {});
  } else {
    // Only as last resort: if platformsData is not available
    console.log("⚠️ platformsData not available, trying data array");
    if (data && data.length > 0) {
      platformCounts = data.reduce((acc, item) => {
        const platform = item.platform || "Unknown";
        acc[platform] = (acc[platform] || 0) + 1;
        return acc;
      }, {});
    }
  }

  console.log("📊 Platform Counts:", platformCounts);

  // Calculate total
  const totalMentions = Object.values(platformCounts).reduce(
    (sum: number, count) => sum + Number(count),
    0
  ) as number;

  console.log("💯 Total Mentions:", totalMentions);

  // Safety check - show empty state if no data at all
  if (totalMentions === 0) {
    console.warn("⚠️ No platform data available");
    return (
      <div className="w-full p-6 bg-white">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sources Distribution - Posts
          </h2>
          <p className="text-gray-600">
            Share of conversations by platform to gauge where your topic is
            being discussed most
          </p>
        </div>
        <div className="w-full h-[450px] flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-lg">No data available</p>
            <p className="text-sm mt-2">
              data.length = {data?.length || 0}, platformsData.length ={" "}
              {platformsData?.length || 0}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Count mentions by platform

  // Convert to chart data format
  // Sort the chartData after creating it
  const chartData = Object.entries(platformCounts)
    .map(([platform, count]) => ({
      name: platform,
      value: count,
      percentage: (((count as number) / totalMentions) * 100).toFixed(1),
    }))
    .sort((a, b) => Number(b.value) - Number(a.value)); // Sort by value descending

  console.log("📈 Chart Data:", chartData);

  // Platform colors - using actual color values
  const platformColors = {
    facebook: "#1877F2", // Facebook blue
    instagram: "#E4405F", // Instagram gradient pink
    twitter: "#1DA1F2", // Twitter blue
    tiktok: "#000000", // TikTok black
    youtube: "#FF0000", // YouTube red
    linkedin: "#0A66C2", // LinkedIn blue
    reddit: "#FF4500", // Reddit orange
    other: "#94A3B8", // Slate gray
    web: "#64748B", // Darker slate
  };

  // Get color for platform or use a default (case-insensitive matching)
  const getColor = (platform, index) => {
    const normalizedPlatform = platform?.toLowerCase() || "unknown";
    const color = platformColors[normalizedPlatform];
    if (color) {
      console.log(
        `🎨 Platform "${platform}" (normalized: "${normalizedPlatform}") -> Color: ${color}`
      );
      return color;
    }
    console.warn(`⚠️ No color for platform: "${platform}", using fallback`);
    return `hsl(${index * 45}, 70%, 50%)`;
  };

  // Handle pie slice click for cross-filtering
  const handlePieSliceClick = (data, index) => {
    if (onFilterChange && data && data.name) {
      const platformName = data.name;
      console.log("🖱️ Platform clicked:", platformName);
      console.log("   Current filter:", activeFilters?.platform);
      console.log("   Is same?:", activeFilters?.platform === platformName);

      // Call the parent's filter change handler
      // The parent will handle the toggle logic
      onFilterChange("platform", platformName);
    }
  };

  // Handle legend click for cross-filtering
  const handleLegendClick = (value, entry) => {
    if (onFilterChange && entry && entry.payload) {
      const platformName = entry.payload.name;
      console.log("🖱️ Legend clicked:", platformName);
      console.log("   Current filter:", activeFilters?.platform);
      console.log("   Is same?:", activeFilters?.platform === platformName);

      // Call the parent's filter change handler
      // The parent will handle the toggle logic
      onFilterChange("platform", platformName);
    }
  };

  // Check if a platform is currently filtered
  const isPlatformFiltered = (platform) => {
    return activeFilters?.platform === platform;
  };

  // Get visual styling based on filter state
  const getFilteredOpacity = (platform) => {
    if (!activeFilters?.platform) return 1; // No filter active
    if (isPlatformFiltered(platform)) {
      return 1; // Highlighted
    } else {
      return 0.3; // Dimmed
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-gray-600">
            <span className="font-medium">{data.value}</span> mentions (
            {data.percentage}%)
          </p>
          {onFilterChange && (
            <p className="text-xs text-gray-400 mt-1 italic">
              Click to filter by this platform
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom label function
  const renderLabel = ({ name, percentage }) => {
    return `${percentage}%`;
  };

  // Custom legend formatter with click handling
  const CustomLegend = (props) => {
    const { payload } = props;

    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {payload.map((entry, index) => {
          const isFiltered = isPlatformFiltered(entry.value);
          const hasActiveFilter = activeFilters?.platform;

          return (
            <div
              key={`legend-${index}`}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md transition-all duration-200 ${
                onFilterChange ? "cursor-pointer hover:bg-gray-100" : ""
              } ${
                isFiltered
                  ? "bg-blue-100 ring-2 ring-blue-500"
                  : hasActiveFilter
                  ? "opacity-50"
                  : ""
              }`}
              onClick={() => handleLegendClick(entry.value, entry)}
            >
              <div
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  isFiltered ? "ring-2 ring-blue-400" : ""
                }`}
                style={{ backgroundColor: entry.color }}
              />
              <span
                className={`text-sm ${
                  isFiltered
                    ? "text-blue-900 font-bold"
                    : "text-gray-700 font-bold"
                }`}
              >
                {entry.value} ({entry.payload.value})
                {isFiltered && <span className="ml-1 text-blue-600">●</span>}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  console.log(
    "🎨 Rendering PlatformDonutChart with",
    chartData.length,
    "slices"
  );

  return (
    <div className="w-full p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Sources Distribution - Posts
        </h2>
        <p className="text-gray-600">
          Share of conversations by platform to gauge where your topic is being
          discussed most
        </p>
      </div>

      <div className="w-full">
        {chartData.length === 0 ? (
          <div className="h-[450px] flex items-center justify-center">
            <p className="text-gray-400">No platform data to display</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={450}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={140}
                innerRadius={0}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
                cursor={onFilterChange ? "pointer" : "default"}
                onClick={handlePieSliceClick}
              >
                {chartData.map((entry, index) => {
                  console.log(
                    `🎨 Rendering Cell ${index}:`,
                    entry.name,
                    entry.value,
                    getColor(entry.name, index)
                  );
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={getColor(entry.name, index)}
                      fillOpacity={getFilteredOpacity(entry.name)}
                      className={
                        onFilterChange
                          ? "hover:opacity-80 transition-all duration-200"
                          : ""
                      }
                    />
                  );
                })}
              </Pie>
              <Legend content={<CustomLegend />} />
              <Tooltip
                content={
                  <CustomTooltip active={undefined} payload={undefined} />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Clickable hint */}
      {onFilterChange && (
        <div className="mt-4">
          <p className="text-xs text-gray-400 italic text-center">
            💡 Click on pie slices or legend items to filter by platform
            {activeFilters?.platform && (
              <span className="text-blue-600 font-medium ml-2">
                (Currently filtering by: {activeFilters.platform})
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default PlatformDonutChart;
