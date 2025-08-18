import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const PlatformDonutChart = ({ data, onFilterChange }) => {
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
      percentage: ((count / data.length) * 100).toFixed(1),
    }))
    .sort((a, b) => b.value - a.value); // Sort by value descending

  // Platform colors
  const platformColors = {
    Facebook: "#1877F2",
    Instagram: "#E4405F",
    Twitter: "#1DA1F2",
    TikTok: "#000000",
    YouTube: "#FF0000",
    LinkedIn: "#0A66C2",
    Reddit: "#FF4500",
    Unknown: "#6B7280",
    Other: "#9CA3AF",
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
        {payload.map((entry, index) => (
          <div
            key={`legend-${index}`}
            className={`flex items-center space-x-2 px-3 py-1 rounded-md ${
              onFilterChange
                ? "cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                : ""
            }`}
            onClick={() => handleLegendClick(entry.value, entry)}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">
              {entry.value} ({entry.payload.value})
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Sources Distribution - Mentions
        </h2>
        <p className="text-gray-600">
          Share of conversations by channel to gauge where your topic is being
          discussed most
        </p>
      </div>

      <div className="w-full">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={120}
              innerRadius={60}
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
                  className={
                    onFilterChange
                      ? "hover:opacity-80 transition-opacity duration-200"
                      : ""
                  }
                />
              ))}
            </Pie>
            <Legend content={<CustomLegend />} />
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Clickable hint */}
      {onFilterChange && (
        <div className="mt-4">
          <p className="text-xs text-gray-400 italic text-center">
            💡 Click on pie slices or legend items to filter by platform
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
