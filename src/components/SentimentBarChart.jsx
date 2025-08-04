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
} from "recharts";

// Using the same sentimentTrend data source from your original component

const SentimentBarChart = ({ sentimentTrend }) => {
  // Calculate overall totals across all dates
  const overallSentiment = sentimentTrend.reduce(
    (totals, day) => ({
      positive: totals.positive + day.positive,
      neutral: totals.neutral + day.neutral,
      negative: totals.negative + day.negative,
    }),
    { positive: 0, neutral: 0, negative: 0 }
  );

  // Convert to array format for BarChart
  const chartData = [
    {
      sentiment: "Positive",
      count: overallSentiment.positive,
      fill: "#10B981",
    },
    { sentiment: "Neutral", count: overallSentiment.neutral, fill: "#6B7280" },
    {
      sentiment: "Negative",
      count: overallSentiment.negative,
      fill: "#EF4444",
    },
  ];

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Overall Sentiment Breakdown
        </h2>
        <p className="text-gray-600">
          Total sentiment analysis across all mentions
        </p>
      </div>

      <div className="w-full">
        <ResponsiveContainer width="100%" height={620}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sentiment" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill={(entry) => entry.fill} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentBarChart;
