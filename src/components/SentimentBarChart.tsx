import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const SentimentBarChart = ({ data = [], onFilterChange }) => {
  const [showNeutral, setShowNeutral] = useState(false);

  // Calculate overall sentiment
  const overallSentiment = data.reduce(
    (totals, item) => {
      totals[item.sentiment] = (totals[item.sentiment] || 0) + 1;
      return totals;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );

  console.log("overallSentiment from component", data.sentiment);

  // Create chart data based on toggle state
  const baseChartData = [
    {
      sentiment: "Positive",
      count: overallSentiment.positive,
      fill: "#10B981",
      key: "positive",
    },
    {
      sentiment: "Negative",
      count: overallSentiment.negative,
      fill: "#EF4444",
      key: "negative",
    },
  ];

  const neutralData = {
    sentiment: "Neutral",
    count: overallSentiment.neutral,
    fill: "#6B7280",
    key: "neutral",
  };

  // Insert neutral data in the middle if showing neutral
  const chartData = showNeutral
    ? [baseChartData[0], neutralData, baseChartData[1]]
    : baseChartData;

  // Handle bar click for cross-filtering
  const handleBarClick = (data, index) => {
    if (onFilterChange && data && data.key) {
      onFilterChange("sentiment", data.key);
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-gray-600">
            <span className="font-medium">{data.value}</span> mentions
          </p>
          {onFilterChange && (
            <p className="text-xs text-gray-400 mt-1 italic">
              Click to filter by {label.toLowerCase()} sentiment
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Overall Sentiment Breakdown
        </h2>
        <p className="text-gray-600">
          Total sentiment analysis across all mentions
        </p>

        {/* Toggle Button */}
        <div className="mt-4">
          <button
            onClick={() => setShowNeutral(!showNeutral)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              showNeutral
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {showNeutral ? "Hide Neutral Numbers" : "View Neutral Numbers"}
          </button>
          {!showNeutral && (
            <span className="ml-3 text-sm text-gray-500">
              ({overallSentiment.neutral} neutral mentions hidden)
            </span>
          )}
        </div>
      </div>

      <div className="w-full">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="sentiment"
              tick={{ fontSize: 12 }}
              className={onFilterChange ? "cursor-pointer" : ""}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              cursor={onFilterChange ? "pointer" : "default"}
              onClick={handleBarClick}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  className={
                    onFilterChange
                      ? "hover:opacity-80 transition-opacity duration-200"
                      : ""
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Clickable hint */}
      {onFilterChange && (
        <div className="mt-4">
          <p className="text-xs text-gray-400 italic text-center">
            💡 Click on bars to filter by sentiment
          </p>
        </div>
      )}
    </div>
  );
};

export default SentimentBarChart;
