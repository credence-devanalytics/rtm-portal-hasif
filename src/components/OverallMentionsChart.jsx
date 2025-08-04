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
} from "recharts";

// Using the same sentimentTrend data source from your original component

const OverallMentionsChart = ({ mentionsOverTime }) => {
  // Calculate total mentions for each date
  const overallData = mentionsOverTime.map((day) => ({
    date: day.date,
    total:
      (day.facebook || 0) +
      (day.instagram || 0) +
      (day.twitter || 0) +
      (day.tiktok || 0),
  }));

  return (
    <div className="w-full">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Mentions Over Time
          </h2>
          <p className="text-gray-600">
            Daily total mentions across all social platforms
          </p>
        </div>

        <div className="w-full">
          <ResponsiveContainer width="100%" height={600}>
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
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [value, "Total Mentions"]}
              />
              <Line
                type="monotone"
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
