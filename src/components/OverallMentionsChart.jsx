import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";

// Using the same sentimentTrend data source from your original component

const OverallMentionsChart = ({ mentionsOverTime }) => {
  if (!mentionsOverTime || mentionsOverTime.length === 0) {
    return <div>No data available</div>;
  }
  // Calculate total mentions for each date
  const overallData = mentionsOverTime.map((day) => {
    const total =
      (day.facebook || 0) +
      (day.instagram || 0) +
      (day.twitter || 0) +
      (day.tiktok || 0) +
      (day.youtube || 0) +
      (day.reddit || 0) +
      (day.linkedin || 0);

    // console.log(`Date: ${day.date}, Total: ${total}`); // Debug log

    return {
      date: day.date,
      total,
    };
  });

  // Calculate peak and average mentions
  const totalMentions = overallData.map((d) => d.total);
  const peakMentions = Math.max(...totalMentions);
  const averageMentions = Math.round(
    totalMentions.reduce((sum, value) => sum + value, 0) / totalMentions.length
  );

  // Find the date of peak mentions
  const peakDate = overallData.find((d) => d.total === peakMentions)?.date;
  // Add this logging in your component to see what data you're actually getting
  // console.log("mentionsOverTime data:", mentionsOverTime?.slice(0, 3));
  return (
    <div className="w-full">
      <div className="p-6 bg-white rounded-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Mentions Over Time
          </h2>
          <p className="text-gray-600">
            Daily total mentions across all social platforms
          </p>

          {/* Statistics Cards */}
          <div className="flex gap-4 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex-1">
              <div className="text-sm text-blue-600 font-medium">
                Peak Mentions
              </div>
              <div className="text-2xl font-bold text-blue-800">
                {peakMentions.toLocaleString()}
              </div>
              <div className="text-xs text-blue-600">
                {peakDate &&
                  new Date(peakDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex-1">
              <div className="text-sm text-green-600 font-medium">
                Average Mentions
              </div>
              <div className="text-2xl font-bold text-green-800">
                {averageMentions.toLocaleString()}
              </div>
              <div className="text-xs text-green-600">Daily average</div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={overallData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                label={{
                  value: "Date",
                  position: "insideBottom",
                  offset: -5,
                  style: {
                    textAnchor: "middle",
                    fontSize: "14px",
                    fontWeight: "bold",
                    fill: "#374151",
                  },
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{
                  value: "Mentions",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                    fontSize: "14px",
                    fontWeight: "bold",
                    fill: "#374151",
                  },
                }}
              />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => {
                  if (name === "Total Mentions") {
                    return [value, "Total Mentions"];
                  }
                  return [value, name];
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium">
                          {new Date(label).toLocaleDateString()}
                        </p>
                        <p className="text-blue-600">
                          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                          Total Mentions: {data.value}
                        </p>
                        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                          <p>
                            Peak: {peakMentions} | Average: {averageMentions}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Reference line for average mentions */}
              <ReferenceLine
                y={averageMentions}
                stroke="#10B981"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `Avg: ${averageMentions}`,
                  position: "topRight",
                  style: {
                    fill: "#10B981",
                    fontSize: "12px",
                    fontWeight: "bold",
                  },
                }}
              />

              {/* Reference line for peak mentions */}
              <ReferenceLine
                y={peakMentions}
                stroke="#EF4444"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `Peak: ${peakMentions}`,
                  position: "topRight",
                  style: {
                    fill: "#EF4444",
                    fontSize: "12px",
                    fontWeight: "bold",
                  },
                }}
              />

              <Line
                type="linear"
                dataKey="total"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#3B82F6" }}
                name="Total Mentions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OverallMentionsChart;
