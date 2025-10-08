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
  onFilterChange,
  activeFilters = {},
}: any) => {
  // Count mentions by platform
  const platformCounts = data.reduce((acc, item) => {
    // console.log(item.platform);
    const platform = item.platform || "Unknown";

    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {});

  console.log("Platform Counts:", platformCounts);
  // Convert to chart data format
  // Sort the chartData after creating it
  const chartData = Object.entries(platformCounts)
    .map(([platform, count]) => ({
      name: platform,
      value: count,
      percentage: (((count as number) / data.length) * 100).toFixed(1),
    }))
    .sort((a, b) => Number(b.value) - Number(a.value)); // Sort by value descending

  // Platform colors using CSS variables
  const platformColors = {
    Facebook: "var(--platform-facebook)",
    Instagram: "var(--platform-instagram)",
    Twitter: "var(--platform-twitter)",
    TikTok: "var(--platform-tiktok)",
    YouTube: "var(--platform-youtube)",
    LinkedIn: "var(--platform-linkedin)",
    Reddit: "var(--platform-reddit)",
    Unknown: "var(--platform-unknown)",
    Other: "var(--platform-other)",
  };

  // Get color for platform or use a default
  const getColor = (platform, index) => {
    return platformColors[platform] || `hsl(${index * 45}, 70%, 50%)`;
  };

  // Handle pie slice click for cross-filtering
  const handlePieSliceClick = (data, index) => {
    if (onFilterChange && data && data.name) {
      onFilterChange("platform", data.name);
    }
  };

  // Handle legend click for cross-filtering
  const handleLegendClick = (value, entry) => {
    if (onFilterChange && entry && entry.payload) {
      onFilterChange("platform", entry.payload.name);
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
              {chartData.map((entry, index) => (
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
              ))}
            </Pie>
            <Legend content={<CustomLegend />} />
            <Tooltip
              content={<CustomTooltip active={undefined} payload={undefined} />}
            />
          </PieChart>
        </ResponsiveContainer>
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

      {/* Summary stats */}
      {/* <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {chartData.map((item, index) => (
          <div
            key={item.name}
            className="text-center p-3 bg-gray-50 rounded-lg"
          >
            <div
              className="w-4 h-4 rounded-full mx-auto mb-2"
              style={{ backgroundColor: getColor(item.name, index) }}
            ></div>
            <p className="text-sm font-semibold text-gray-800">{item.name}</p>
            <p className="text-lg font-bold text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-500">{item.percentage}%</p>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default PlatformDonutChart;
