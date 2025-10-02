import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const SentimentPieChart = ({
  data,
  onChartClick,
  activeFilters,
  isLoading,
}) => {
  // Color scheme for sentiments
  const COLORS = {
    positive: "#10B981", // green
    negative: "#EF4444", // red
    neutral: "#6B7280", // gray
  };

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!data) return [];

    return [
      {
        name: "Positive",
        value: data.positive || 0,
        sentiment: "positive",
        color: COLORS.positive,
      },
      {
        name: "Negative",
        value: data.negative || 0,
        sentiment: "negative",
        color: COLORS.negative,
      },
      {
        name: "Neutral",
        value: data.neutral || 0,
        sentiment: "neutral",
        color: COLORS.neutral,
      },
    ].filter((item) => item.value > 0);
  }, [data]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.payload.name} Sentiment</p>
          <p className="text-sm">
            Count:{" "}
            <span className="font-semibold">{data.value.toLocaleString()}</span>
          </p>
          <p className="text-sm">
            Percentage: <span className="font-semibold">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Handle pie slice click
  const handlePieClick = (data, index) => {
    if (onChartClick) {
      onChartClick("sentiment", data.sentiment);
    }
  };

  // Custom label function
  const renderLabel = ({ name, value, percent }) => {
    return `${(percent * 100).toFixed(0)}%`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">No sentiment data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Sentiment Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">
          Click on a segment to filter by sentiment
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                onClick={handlePieClick}
                className="cursor-pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={
                      activeFilters?.sentiments?.includes(entry.sentiment)
                        ? "#1F2937"
                        : "none"
                    }
                    strokeWidth={
                      activeFilters?.sentiments?.includes(entry.sentiment)
                        ? 3
                        : 0
                    }
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>
                    {value} ({entry.payload.value.toLocaleString()})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            {chartData.map((item) => (
              <div key={item.sentiment} className="space-y-1">
                <div
                  className="w-4 h-4 rounded mx-auto"
                  style={{ backgroundColor: item.color }}
                />
                <div className="text-xs font-medium">{item.name}</div>
                <div className="text-sm font-bold">
                  {((item.value / total) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { SentimentPieChart };
