import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const PlatformDonutChart = ({ data }) => {
  // Count mentions by platform
  const platformCounts = data.reduce((acc, item) => {
    console.log(item.platform);
    const platform = item.platform || "Unknown";

    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {});

  // Convert to chart data format
  const chartData = Object.entries(platformCounts).map(([platform, count]) => ({
    name: platform,
    value: count,
    percentage: ((count / data.length) * 100).toFixed(1),
  }));

  // Platform colors
  const platformColors = {
    facebook: "#1877F2",
    instagram: "#E4405F",
    twitter: "#1DA1F2",
    tiktok: "#000000",
    youtube: "#FF0000",
    linkedin: "#0A66C2",
    reddit: "#FF4500",
    unknown: "#6B7280",
    other: "#9CA3AF",
  };

  // Get color for platform or use a default
  const getColor = (platform, index) => {
    return platformColors[platform] || `hsl(${index * 45}, 70%, 50%)`;
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
        </div>
      );
    }
    return null;
  };

  // Custom label function
  const renderLabel = ({ name, percentage }) => {
    return `${percentage}%`;
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg">
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
        <ResponsiveContainer width="100%" height={600}>
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
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColor(entry.name, index)}
                />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={100}
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>
                  {value} ({entry.payload.value})
                </span>
              )}
            />
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

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
