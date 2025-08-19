import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
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
          totalReach: 0,
          postsCount: 0,
        };
      }

      groupedByDate[date].totalReach += item.reach || 0;
      groupedByDate[date].postsCount += 1; // Count each mention/post
    });

    return Object.values(groupedByDate)
      .map((day) => ({
        date: day.date,
        reach: day.totalReach,
        posts: day.postsCount,
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
            Reach Over Time
          </h2>
          <p className="text-gray-600 mb-6">No reach data available</p>
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
  const maxPosts = Math.max(...engagementData.map((d) => d.posts));
  const maxReach = Math.max(...engagementData.map((d) => d.reach));

  return (
    <div className="w-full">
      <div className="p-6 bg-white ">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reach Over Time
          </h2>
          <p className="text-gray-600">
            Daily posts/mentions count and reach trends across all platforms
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-800">
              {Math.round(
                engagementData.reduce((sum, day) => sum + day.posts, 0) /
                  engagementData.length
              ).toLocaleString()}
            </div>
            <div className="text-sm text-blue-600">
              Avg Daily Posts/Mentions
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(
                engagementData.reduce((sum, day) => sum + day.reach, 0) /
                  engagementData.length
              ).toLocaleString()}
            </div>
            <div className="text-sm text-orange-800">Avg Daily Reach</div>
          </div>
        </div>

        <div className="w-full">
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart
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
                yAxisId="left"
                tick={{ fontSize: 12 }}
                orientation="left"
              />
              <YAxis
                yAxisId="right"
                tick={{ fontSize: 12 }}
                orientation="right"
                tickFormatter={(value) => {
                  if (value >= 1000000)
                    return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                  return value.toString();
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />

              {/* Bar Chart for Posts/Mentions */}
              <Bar
                yAxisId="left"
                dataKey="posts"
                fill="#3B82F6"
                name="Posts/Mentions"
                fillOpacity={0.8}
              />

              {/* Line Chart for Reach */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="reach"
                stroke="#f54a00"
                strokeWidth={3}
                name="Reach"
                dot={{ fill: "#f54a00", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#f54a00", strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Additional Insights */}
        {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Key Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <strong>Peak Posts Day:</strong>{" "}
              {engagementData.reduce(
                (max, day) => (day.posts > max.posts ? day : max),
                engagementData[0]
              )?.date &&
                new Date(
                  engagementData.reduce(
                    (max, day) => (day.posts > max.posts ? day : max),
                    engagementData[0]
                  ).date
                ).toLocaleDateString()}{" "}
              (
              {engagementData
                .reduce(
                  (max, day) => (day.posts > max.posts ? day : max),
                  engagementData[0]
                )
                ?.posts?.toLocaleString()}{" "}
              posts)
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
