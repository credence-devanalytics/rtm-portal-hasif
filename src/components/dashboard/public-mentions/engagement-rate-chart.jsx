import React, { useMemo } from "react";
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
import { TrendingUp, BarChart3, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EngagementRateChart = ({
  data = [],
  onChartClick,
  activeFilters,
  isLoading,
}) => {
  // Memoized data processing for performance
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      console.log("No data available for engagement chart");
      return [];
    }

    console.log("Raw engagement data:", data);

    // First pass: collect all values to find min/max for normalization
    const reaches = [];
    const engagements = [];

    const rawData = data.map((item) => {
      const dateValue = item.date || item.Date || item.inserttime;
      const reach = parseInt(
        item.totalReach || item.totalreach || item.total_reach || 0
      );
      const interactions = parseInt(
        item.totalInteractions ||
          item.totalinteractions ||
          item.total_interactions ||
          0
      );

      reaches.push(reach);
      engagements.push(interactions);

      return {
        date: dateValue,
        postCount: parseInt(
          item.postCount || item.postcount || item.count || 0
        ),
        avgEngagementRate: parseFloat(
          item.avgEngagementRate ||
            item.avgengagementrate ||
            item.avg_engagement_rate ||
            0
        ),
        totalReach: reach,
        totalInteractions: interactions,
      };
    });

    // Calculate min/max for normalization
    const minReach = Math.min(...reaches);
    const maxReach = Math.max(...reaches);
    const minEngagement = Math.min(...engagements);
    const maxEngagement = Math.max(...engagements);

    // Normalize function (0-100 scale)
    const normalize = (value, min, max) => {
      if (max === min) return 50; // If all values are the same, return middle
      return ((value - min) / (max - min)) * 100;
    };

    // Second pass: add normalized values
    let isFirstItem = true;
    const formatted = rawData.map((item) => {
      const normalizedReach = normalize(item.totalReach, minReach, maxReach);
      const normalizedEngagement = normalize(
        item.totalInteractions,
        minEngagement,
        maxEngagement
      );

      const processedItem = {
        ...item,
        reachTrend: parseFloat(normalizedReach.toFixed(1)), // Normalized 0-100
        engagementTrend: parseFloat(normalizedEngagement.toFixed(1)), // Normalized 0-100
      };

      // Log first item for verification
      if (isFirstItem) {
        console.log("Sample processed item:", {
          date: processedItem.date,
          postCount: processedItem.postCount,
          totalReach: processedItem.totalReach,
          totalInteractions: processedItem.totalInteractions,
          normalizedReach: processedItem.reachTrend,
          normalizedEngagement: processedItem.engagementTrend,
        });
        isFirstItem = false;
      }

      return processedItem;
    });

    console.log("Processed engagement data:", formatted);
    return formatted;
  }, [data]);

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    // Handle different date formats
    try {
      // Try to parse the date - handle both ISO strings and simple date strings
      const date = new Date(dateStr);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateStr; // Return original string if parsing fails
      }

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", dateStr, error);
      return dateStr;
    }
  };

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toLocaleString();
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0]?.payload;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs">
        <div className="font-semibold text-gray-900 mb-2">
          {formatDate(label)}
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              Posts/Mentions:
            </span>
            <span className="font-medium">{data?.postCount || 0} posts</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-orange-600" />
              Reach Trend:
            </span>
            <span className="font-medium">
              {formatNumber(data?.totalReach || 0)} (reach)
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-600" />
              Engagement Trend:
            </span>
            <span className="font-medium">
              {formatNumber(data?.totalInteractions || 0)} (engagement)
            </span>
          </div>
          <div className="pt-2 mt-2 border-t border-gray-200 text-xs text-gray-500">
            * Reach and engagement are shown as relative trends (0-100%)
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Engagement Rate Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!data || data.length === 0 || processedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Engagement Rate Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-96 text-gray-500">
            <TrendingUp className="w-12 h-12 mb-2 opacity-40" />
            <p className="text-lg font-medium">No engagement data available</p>
            <p className="text-sm">
              Data will appear here when mentions are loaded
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary stats
  const totalPosts = processedData.reduce(
    (sum, item) => sum + item.postCount,
    0
  );
  const totalReach = processedData.reduce(
    (sum, item) => sum + item.totalReach,
    0
  );
  const totalEngagement = processedData.reduce(
    (sum, item) => sum + item.totalInteractions,
    0
  );

  return (
    <Card>
      {/* Header */}
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Engagement Over Time
            </CardTitle>
            <p className="text-sm text-gray-600">
              Daily posts count with normalized reach and engagement trends
              (0-100% relative scale)
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Chart */}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                label={{
                  value: "Posts",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                    fill: "#6b7280",
                    fontSize: "12px",
                  },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "#6b7280" }}
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
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />

              {/* Bar for Post Count */}
              <Bar
                yAxisId="left"
                dataKey="postCount"
                name="Posts/Mentions"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />

              {/* Line for Reach Trend (normalized) */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="reachTrend"
                name="Reach Trend"
                stroke="#fb923c"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#fb923c", r: 3 }}
                activeDot={{ r: 5 }}
              />

              {/* Line for Engagement Trend (normalized) */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="engagementTrend"
                name="Engagement Trend"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {totalPosts.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Avg Daily Posts/Mentions
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {formatNumber(totalReach)}
              </div>
              <div className="text-sm text-gray-600">Avg Daily Reach</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(totalEngagement)}
              </div>
              <div className="text-sm text-gray-600">Avg Daily Engagement</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EngagementRateChart;
