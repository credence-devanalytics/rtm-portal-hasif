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
  // Create engagement data grouped by date with proper reach and interaction calculation
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
          totalReachUsed: 0,
          postsCount: 0,
          totalInteractions: 0,
        };
      }

      // Calculate reach_used: prefer reach, then viewcount, then followerscount, then sourcereach
      // Use NULLIF logic - only use non-zero values
      const reachUsed =
        (item.reach && Number(item.reach) !== 0 ? Number(item.reach) : null) ||
        (item.viewcount && Number(item.viewcount) !== 0
          ? Number(item.viewcount)
          : null) ||
        (item.followerscount && Number(item.followerscount) !== 0
          ? Number(item.followerscount)
          : null) ||
        (item.sourcereach && Number(item.sourcereach) !== 0
          ? Number(item.sourcereach)
          : null) ||
        0;

      // Calculate interactions: prefer interaction, then totalreactionscount, then sum of engagement fields
      const interactions =
        (item.interaction && Number(item.interaction) !== 0
          ? Number(item.interaction)
          : null) ||
        (item.totalreactionscount && Number(item.totalreactionscount) !== 0
          ? Number(item.totalreactionscount)
          : null) ||
        Number(item.likecount || 0) +
          Number(item.commentcount || 0) +
          Number(item.sharecount || 0) +
          Number(item.playcount || 0) +
          Number(item.replycount || 0) +
          Number(item.retweetcount || 0);

      groupedByDate[date].totalReachUsed += reachUsed;
      groupedByDate[date].postsCount += 1; // Count each mention/post
      groupedByDate[date].totalInteractions += interactions;
    });

    const rawData = Object.values(groupedByDate)
      .map((day: any) => {
        // Calculate engagement rate: (interactions / reach) * 100
        const engagementRate =
          day.totalReachUsed > 0
            ? (day.totalInteractions / day.totalReachUsed) * 100
            : 0;

        return {
          date: day.date,
          reach: day.totalReachUsed,
          posts: day.postsCount,
          interactions: day.totalInteractions,
          engagementRate: engagementRate,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Find max values for normalization
    const maxReach = Math.max(...rawData.map((d) => d.reach));
    const maxInteractions = Math.max(...rawData.map((d) => d.interactions));
    const maxEngagementRate = Math.max(...rawData.map((d) => d.engagementRate));

    // Normalize reach and interactions to 0-100 scale for visualization
    return rawData.map((day) => ({
      ...day,
      reachNormalized: maxReach > 0 ? (day.reach / maxReach) * 100 : 0,
      interactionsNormalized:
        maxInteractions > 0 ? (day.interactions / maxInteractions) * 100 : 0,
      // Keep original values for tooltip
      reachOriginal: day.reach,
      interactionsOriginal: day.interactions,
      engagementRateOriginal: day.engagementRate,
    }));
  };

  const engagementData = createEngagementOverTime(data);

  // Debug logging to see the data structure
  console.log("EngagementOverTimeChart - Raw data sample:", data?.slice(0, 2));
  console.log(
    "EngagementOverTimeChart - Processed data sample:",
    engagementData?.slice(0, 2)
  );

  // Debug: Check for data with actual reach/interactions
  if (data && data.length > 0) {
    const sampleWithData = data.find(
      (item) =>
        (item.reach && Number(item.reach) > 0) ||
        (item.viewcount && Number(item.viewcount) > 0) ||
        (item.interaction && Number(item.interaction) > 0) ||
        (item.likecount && Number(item.likecount) > 0)
    );
    console.log(
      "EngagementOverTimeChart - Sample with engagement data:",
      sampleWithData
    );

    // Count how many items have reach data
    const withReach = data.filter(
      (item) =>
        (item.reach && Number(item.reach) > 0) ||
        (item.viewcount && Number(item.viewcount) > 0) ||
        (item.followerscount && Number(item.followerscount) > 0) ||
        (item.sourcereach && Number(item.sourcereach) > 0)
    ).length;

    const withInteractions = data.filter(
      (item) =>
        (item.interaction && Number(item.interaction) > 0) ||
        (item.totalreactionscount && Number(item.totalreactionscount) > 0) ||
        (item.likecount && Number(item.likecount) > 0) ||
        (item.commentcount && Number(item.commentcount) > 0)
    ).length;

    console.log(
      `EngagementOverTimeChart - Items with reach: ${withReach}/${data.length}`
    );
    console.log(
      `EngagementOverTimeChart - Items with interactions: ${withInteractions}/${data.length}`
    );
  }

  // Safety check
  if (!engagementData || engagementData.length === 0) {
    return (
      <div className="w-full">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Engagement Over Time
          </h2>
          <p className="text-gray-600 mb-6">No engagement data available</p>
          {data && data.length > 0 && (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
              <p>
                <strong>Note:</strong> {data.length} posts found, but no
                engagement metrics (reach/interactions) available.
              </p>
              <p className="mt-1 text-xs">
                Check if the data source includes fields like: reach, viewcount,
                interaction, likecount, etc.
              </p>
            </div>
          )}
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

            // Show original values for reach and interactions
            if (entry.dataKey === "reachNormalized") {
              const originalReach = entry.payload.reachOriginal;
              displayValue = originalReach?.toLocaleString();
              suffix = " (reach)";
            } else if (entry.dataKey === "interactionsNormalized") {
              const originalInteractions = entry.payload.interactionsOriginal;
              displayValue = originalInteractions?.toLocaleString();
              suffix = " (interactions)";
            } else if (entry.dataKey === "engagementRate") {
              const originalRate = entry.payload.engagementRateOriginal;
              displayValue = originalRate?.toFixed(2);
              suffix = "% (engagement rate)";
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
            <p>
              * Reach and interactions are shown as relative trends (0-100%)
            </p>
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
  const totalInteractions = engagementData.reduce(
    (sum, day) => sum + day.interactionsOriginal,
    0
  );
  const avgEngagementRate =
    totalReach > 0 ? (totalInteractions / totalReach) * 100 : 0;

  return (
    <div className="w-full">
      <div className="p-6 bg-white ">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Engagement Over Time
          </h2>
          <p className="text-gray-600">
            Daily posts count with reach, interactions, and engagement rate
            trends
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-800">
              {Math.round(
                engagementData.reduce((sum, day) => sum + day.posts, 0) /
                  engagementData.length
              ).toLocaleString()}
            </div>
            <div className="text-sm text-blue-600">Avg Daily Posts</div>
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
                totalInteractions / engagementData.length
              ).toLocaleString()}
            </div>
            <div className="text-sm text-green-800">Avg Daily Interactions</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {avgEngagementRate.toFixed(2)}%
            </div>
            <div className="text-sm text-purple-800">Avg Engagement Rate</div>
          </div>
        </div>

        <div className="w-full">
          <ResponsiveContainer width="100%" height={280}>
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
              {/* Right Y-axis for Normalized Trends */}
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
              {/* Second Right Y-axis for Engagement Rate */}
              <YAxis
                yAxisId="engagementRate"
                tick={{ fontSize: 12 }}
                orientation="right"
                label={{
                  value: "Engagement Rate (%)",
                  angle: 90,
                  position: "outside",
                  style: {
                    textAnchor: "middle",
                    fill: "#9333EA",
                    fontSize: "12px",
                  },
                }}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
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

              {/* Bar Chart for Posts */}
              <Bar
                yAxisId="left"
                dataKey="posts"
                fill="#4E5899"
                name="Posts"
                fillOpacity={0.8}
              />

              {/* Line Chart for Normalized Reach */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="reachNormalized"
                stroke="#ff9705"
                strokeWidth={2}
                name="Reach Trend"
                dot={{ fill: "#ff9705", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: "#ff9705", strokeWidth: 2 }}
              />

              {/* Line Chart for Normalized Interactions */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="interactionsNormalized"
                stroke="#28a745"
                strokeWidth={2}
                name="Interactions Trend"
                dot={{ fill: "#28a745", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: "#10B981", strokeWidth: 2 }}
              />

              {/* Line Chart for Engagement Rate */}
              <Line
                yAxisId="engagementRate"
                type="monotone"
                dataKey="engagementRate"
                stroke="#9333EA"
                strokeWidth={3}
                strokeDasharray="5 5"
                name="Engagement Rate"
                dot={{ fill: "#9333EA", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#9333EA", strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend explanation */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Chart Explanation:</strong> Posts are shown as absolute
            counts (blue bars, left axis). Reach and interactions trends are
            normalized to 0-100% relative scale (solid lines, right axis) to
            compare their patterns over time. Engagement rate (dashed purple
            line) shows the actual percentage of interactions relative to reach.
            Hover over data points to see original values.
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
