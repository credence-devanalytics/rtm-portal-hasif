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
          totalEngagement: 0,
        };
      }

      groupedByDate[date].totalReach += item.reach || 0;
      groupedByDate[date].postsCount += 1; // Count each mention/post
      groupedByDate[date].totalEngagement +=
        item.interactions ||
        (item.likecount || 0) +
          (item.sharecount || 0) +
          (item.commentcount || 0) +
          (item.viewcount || 0);
    });

    const rawData = Object.values(groupedByDate)
      .map((day: any) => ({
        date: day.date,
        reach: day.totalReach,
        posts: day.postsCount,
        engagement: day.totalEngagement,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Find max values for normalization
    const maxReach = Math.max(...rawData.map((d) => d.reach));
    const maxEngagement = Math.max(...rawData.map((d) => d.engagement));

    // Normalize reach and engagement to 0-100 scale
    return rawData.map((day) => ({
      ...day,
      reachNormalized: maxReach > 0 ? (day.reach / maxReach) * 100 : 0,
      engagementNormalized:
        maxEngagement > 0 ? (day.engagement / maxEngagement) * 100 : 0,
      // Keep original values for tooltip
      reachOriginal: day.reach,
      engagementOriginal: day.engagement,
    }));
  };

  const engagementData = createEngagementOverTime(data);

  // Debug logging to see the data structure
  console.log("EngagementOverTimeChart - Raw data sample:", data?.slice(0, 2));
  console.log(
    "EngagementOverTimeChart - Processed data sample:",
    engagementData?.slice(0, 2)
  );

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

  // Custom tooltip with original values
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">
            {new Date(label).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          {payload.map((entry) => {
            let displayValue = entry.value;
            let suffix = "";

            // Show original values for reach and engagement
            if (entry.dataKey === "reachNormalized") {
              const originalReach = entry.payload.reachOriginal;
              displayValue = originalReach?.toLocaleString();
              suffix = " (reach)";
            } else if (entry.dataKey === "engagementNormalized") {
              const originalEngagement = entry.payload.engagementOriginal;
              displayValue = originalEngagement?.toLocaleString();
              suffix = " (engagement)";
            } else if (entry.dataKey === "posts") {
              displayValue = entry.value?.toLocaleString();
              suffix = " posts";
            }

            return (
              <p
                key={entry.dataKey}
                className="text-sm"
                style={{ color: entry.color }}
              >
                {entry.name}: {displayValue}
                {suffix}
              </p>
            );
          })}
          <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <p>* Reach and engagement are shown as relative trends (0-100%)</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Find max values for summary stats
  const maxPosts = Math.max(...engagementData.map((d) => d.posts));
  const totalReach = engagementData.reduce(
    (sum, day) => sum + day.reachOriginal,
    0
  );
  const totalEngagement = engagementData.reduce(
    (sum, day) => sum + day.engagementOriginal,
    0
  );

  return (
    <div className="w-full">
      <div className="p-6 bg-white ">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Engagement Over Time
          </h2>
          <p className="text-gray-600">
            Daily posts count with normalized reach and engagement trends
            (0-100% relative scale)
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
              {Math.round(totalReach / engagementData.length).toLocaleString()}
            </div>
            <div className="text-sm text-orange-800">Avg Daily Reach</div>
          </div>
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(
                totalEngagement / engagementData.length
              ).toLocaleString()}
            </div>
            <div className="text-sm text-green-800">Avg Daily Engagement</div>
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
              {/* Left Y-axis for Posts */}
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12 }}
                orientation="left"
                label={{
                  value: "Posts",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                    fill: "#3B82F6",
                    fontSize: "12px",
                  },
                }}
              />
              {/* Right Y-axis for Normalized Reach & Engagement */}
              <YAxis
                yAxisId="right"
                tick={{ fontSize: 12 }}
                orientation="right"
                domain={[0, 100]}
                label={{
                  value: "Relative Trend (%)",
                  angle: 90,
                  position: "insideRight",
                  style: {
                    textAnchor: "middle",
                    fill: "#6b7280",
                    fontSize: "12px",
                  },
                }}
                tickFormatter={(value) => `${value}%`}
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
              <Legend wrapperStyle={{ paddingTop: "20px" }} />

              {/* Bar Chart for Posts/Mentions */}
              <Bar
                yAxisId="left"
                dataKey="posts"
                fill="#4E5899"
                name="Posts/Mentions"
                fillOpacity={0.8}
              />

              {/* Line Chart for Normalized Reach */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="reachNormalized"
                stroke="#ff9705"
                strokeWidth={3}
                name="Reach Trend"
                dot={{ fill: "#ff9705", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#ff9705", strokeWidth: 2 }}
              />

              {/* Line Chart for Normalized Engagement */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="engagementNormalized"
                stroke="#28a745"
                strokeWidth={3}
                name="Engagement Trend"
                dot={{ fill: "#28a745", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend explanation */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Chart Explanation:</strong> Posts are shown as absolute
            counts (blue bars, left axis). Reach and engagement trends are
            normalized to 0-100% relative scale (lines, right axis) to compare
            their patterns over time. Hover over data points to see original
            values.
          </p>
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
