import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

const SentimentAreaChart = ({
  data,
  onChartClick,
  activeFilters,
  isLoading,
}) => {
  // Color scheme for sentiments
  const SENTIMENT_COLORS = {
    positive: "#10B981", // green
    negative: "#EF4444", // red
    neutral: "#6B7280", // gray
  };

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data
      .map((item) => ({
        date: item.date,
        positive: item.positive || 0,
        negative: item.negative || 0,
        neutral: item.neutral || 0,
        total:
          (item.positive || 0) + (item.negative || 0) + (item.neutral || 0),
        formattedDate: item.date
          ? format(parseISO(item.date), "MMM dd")
          : "Unknown",
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .filter((item) => item.total > 0);
  }, [data]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, item) => sum + item.value, 0);

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}:{" "}
              <span className="font-semibold">
                {item.value.toLocaleString()}
              </span>{" "}
              ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)
            </p>
          ))}
          <p className="text-sm font-semibold border-t pt-1 mt-1">
            Total: {total.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  // Handle area click
  const handleAreaClick = (data, index) => {
    if (onChartClick) {
      // You could implement date range filtering here
      console.log("Area chart clicked:", data);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Trends Over Time</CardTitle>
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
          <CardTitle>Sentiment Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">No timeline data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Sentiment Trends Over Time</CardTitle>
        <p className="text-sm text-muted-foreground">
          Daily sentiment distribution showing trends over time
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              onClick={handleAreaClick}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="positive"
                stackId="1"
                stroke={SENTIMENT_COLORS.positive}
                fill={SENTIMENT_COLORS.positive}
                fillOpacity={0.6}
                name="Positive"
                className="cursor-pointer hover:opacity-80"
              />
              <Area
                type="monotone"
                dataKey="neutral"
                stackId="1"
                stroke={SENTIMENT_COLORS.neutral}
                fill={SENTIMENT_COLORS.neutral}
                fillOpacity={0.6}
                name="Neutral"
                className="cursor-pointer hover:opacity-80"
              />
              <Area
                type="monotone"
                dataKey="negative"
                stackId="1"
                stroke={SENTIMENT_COLORS.negative}
                fill={SENTIMENT_COLORS.negative}
                fillOpacity={0.6}
                name="Negative"
                className="cursor-pointer hover:opacity-80"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Time Series Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Days</div>
              <div className="text-lg font-bold text-gray-900">
                {chartData.length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Avg Daily</div>
              <div className="text-lg font-bold text-gray-900">
                {chartData.length > 0
                  ? Math.round(
                      chartData.reduce((sum, item) => sum + item.total, 0) /
                        chartData.length
                    )
                  : 0}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Peak Day</div>
              <div className="text-lg font-bold text-gray-900">
                {chartData.length > 0
                  ? Math.max(...chartData.map((item) => item.total))
                  : 0}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Date Range</div>
              <div className="text-sm font-bold text-gray-900">
                {chartData.length > 0
                  ? `${chartData[0].formattedDate} - ${
                      chartData[chartData.length - 1].formattedDate
                    }`
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { SentimentAreaChart };
