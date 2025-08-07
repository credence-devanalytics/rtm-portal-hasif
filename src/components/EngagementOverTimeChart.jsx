import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const EngagementOverTimeChart = ({ data }) => {
  // Create engagement data grouped by date
  const createEngagementOverTime = (transformedData) => {
    if (!transformedData || transformedData.length === 0) {
      return [];
    }

    const groupedByDate = {};

    transformedData.forEach((item) => {
      const date = item.date;
      if (!groupedByDate[date]) {
        groupedByDate[date] = {
          date,
          totalInteractions: 0,
          totalReach: 0,
          count: 0,
        };
      }

      groupedByDate[date].totalInteractions += item.interactions || 0;
      groupedByDate[date].totalReach += item.reach || 0;
      groupedByDate[date].count += 1;
    });

    return Object.values(groupedByDate)
      .map((day) => ({
        date: day.date,
        interactions: day.totalInteractions,
        reach: day.totalReach,
        avgInteractions: Math.round(day.totalInteractions / day.count),
        avgReach: Math.round(day.totalReach / day.count),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const engagementData = createEngagementOverTime(data);

  // Safety check
  if (!engagementData || engagementData.length === 0) {
    return (
      <div className="w-full">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Engagement Over Time
          </h2>
          <p className="text-gray-600 mb-6">No engagement data available</p>
        </div>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4">
          <p className="font-semibold text-gray-900 mb-2">
            {new Date(label).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          {payload.map((entry) => (
            <p
              key={entry.dataKey}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Find max values for better scaling
  const maxInteractions = Math.max(
    ...engagementData.map((d) => d.interactions)
  );
  const maxReach = Math.max(...engagementData.map((d) => d.reach));

  return (
    <div className="w-full">
      <div className="p-6 bg-white ">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Engagement Over Time
          </h2>
          <p className="text-gray-600">
            Daily interaction and reach trends across all platforms
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {engagementData
                .reduce((sum, day) => sum + day.interactions, 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-blue-800">Total Interactions</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {engagementData
                .reduce((sum, day) => sum + day.reach, 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-green-800">Total Reach</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(
                engagementData.reduce(
                  (sum, day) => sum + day.avgInteractions,
                  0
                ) / engagementData.length
              ).toLocaleString()}
            </div>
            <div className="text-sm text-purple-800">
              Avg Daily Interactions
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(
                engagementData.reduce((sum, day) => sum + day.avgReach, 0) /
                  engagementData.length
              ).toLocaleString()}
            </div>
            <div className="text-sm text-orange-800">Avg Daily Reach</div>
          </div>
        </div>

        <div className="w-full">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={engagementData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000000)
                    return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                  return value.toString();
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />

              {/* Reach Area (background) */}
              <Area
                type="monotone"
                dataKey="reach"
                stackId="1"
                stroke="#10B981"
                fill="url(#reachGradient)"
                strokeWidth={2}
                name="Total Reach"
                fillOpacity={0.6}
              />

              {/* Interactions Area (foreground) */}
              <Area
                type="monotone"
                dataKey="interactions"
                stackId="2"
                stroke="#3B82F6"
                fill="url(#interactionGradient)"
                strokeWidth={2}
                name="Total Interactions"
                fillOpacity={0.8}
              />

              {/* Gradients */}
              <defs>
                <linearGradient
                  id="interactionGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="reachGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Additional Insights */}
        {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Key Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <strong>Peak Interaction Day:</strong>{" "}
              {engagementData.reduce(
                (max, day) => (day.interactions > max.interactions ? day : max),
                engagementData[0]
              )?.date &&
                new Date(
                  engagementData.reduce(
                    (max, day) =>
                      day.interactions > max.interactions ? day : max,
                    engagementData[0]
                  ).date
                ).toLocaleDateString()}{" "}
              (
              {engagementData
                .reduce(
                  (max, day) =>
                    day.interactions > max.interactions ? day : max,
                  engagementData[0]
                )
                ?.interactions?.toLocaleString()}{" "}
              interactions)
            </div>
            <div>
              <strong>Peak Reach Day:</strong>{" "}
              {engagementData.reduce(
                (max, day) => (day.reach > max.reach ? day : max),
                engagementData[0]
              )?.date &&
                new Date(
                  engagementData.reduce(
                    (max, day) => (day.reach > max.reach ? day : max),
                    engagementData[0]
                  ).date
                ).toLocaleDateString()}{" "}
              (
              {engagementData
                .reduce(
                  (max, day) => (day.reach > max.reach ? day : max),
                  engagementData[0]
                )
                ?.reach?.toLocaleString()}{" "}
              reach)
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default EngagementOverTimeChart;
