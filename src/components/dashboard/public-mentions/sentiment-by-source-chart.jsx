import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const SentimentBySourceChart = ({
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

  // Get platform icon
  const getPlatformIcon = (platform) => {
    const iconClass = "h-4 w-4";
    switch (platform.toLowerCase()) {
      case "facebook":
        return <Facebook className={iconClass} />;
      case "twitter":
        return <Twitter className={iconClass} />;
      case "instagram":
        return <Instagram className={iconClass} />;
      case "linkedin":
        return <Linkedin className={iconClass} />;
      case "youtube":
        return <Youtube className={iconClass} />;
      default:
        return null;
    }
  };

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data
      .map((item) => ({
        platform: item.platform || item.source || "Unknown",
        positive: item.positive || 0,
        negative: item.negative || 0,
        neutral: item.neutral || 0,
        total:
          (item.positive || 0) + (item.negative || 0) + (item.neutral || 0),
      }))
      .filter((item) => item.total > 0);
  }, [data]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, item) => sum + item.value, 0);

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            {getPlatformIcon(label)}
            <p className="font-medium">{label}</p>
          </div>
          {payload.map((item, index) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}:{" "}
              <span className="font-semibold">
                {item.value.toLocaleString()}
              </span>{" "}
              ({((item.value / total) * 100).toFixed(1)}%)
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

  // Handle bar click
  const handleBarClick = (data, index) => {
    if (onChartClick) {
      onChartClick("source", data.platform);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment by Platform</CardTitle>
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
          <CardTitle>Sentiment by Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">No platform data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Sentiment by Platform</CardTitle>
        <p className="text-sm text-muted-foreground">
          Click on a bar to filter by platform
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              onClick={handleBarClick}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="platform"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="positive"
                stackId="sentiment"
                fill={SENTIMENT_COLORS.positive}
                name="Positive"
                className="cursor-pointer hover:opacity-80"
              />
              <Bar
                dataKey="neutral"
                stackId="sentiment"
                fill={SENTIMENT_COLORS.neutral}
                name="Neutral"
                className="cursor-pointer hover:opacity-80"
              />
              <Bar
                dataKey="negative"
                stackId="sentiment"
                fill={SENTIMENT_COLORS.negative}
                name="Negative"
                className="cursor-pointer hover:opacity-80"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {chartData.slice(0, 4).map((item) => {
              const isActive = activeFilters?.sources?.includes(item.platform);
              return (
                <div
                  key={item.platform}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                    isActive
                      ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() =>
                    onChartClick && onChartClick("source", item.platform)
                  }
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getPlatformIcon(item.platform)}
                    <span className="text-sm font-medium">{item.platform}</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {item.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">total mentions</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { SentimentBySourceChart };
