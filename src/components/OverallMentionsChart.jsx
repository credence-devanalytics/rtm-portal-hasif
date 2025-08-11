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
