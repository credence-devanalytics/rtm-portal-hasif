import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { TrendingUp, Filter, Hash, MessageSquare } from "lucide-react";

const SentimentByTopicsChart = ({
  data,
  onChartClick,
  activeFilters,
  isLoading,
}) => {
  const [sortBy, setSortBy] = React.useState("total"); // 'total', 'positive', 'negative', 'topic'
  const [showCount, setShowCount] = React.useState(10);

  // Process and sort data
  const processedData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    let sortedData = [...data];

    switch (sortBy) {
      case "positive":
        sortedData.sort((a, b) => b.positive - a.positive);
        break;
      case "negative":
        sortedData.sort((a, b) => b.negative - a.negative);
        break;
      case "topic":
        sortedData.sort((a, b) => a.topic.localeCompare(b.topic));
        break;
      default: // 'total'
        sortedData.sort((a, b) => b.total - a.total);
    }

    return sortedData.slice(0, showCount);
  }, [data, sortBy, showCount]);

  // Handle bar click for cross-filtering
  const handleBarClick = (data, dataKey) => {
    if (onChartClick) {
      onChartClick({
        type: "topic-sentiment",
        topic: data.topic,
        sentiment: dataKey,
        value: data[dataKey],
      });
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = data.positive + data.negative + data.neutral;

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>
                Positive: {data.positive} (
                {((data.positive / total) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>
                Negative: {data.negative} (
                {((data.negative / total) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span>
                Neutral: {data.neutral} (
                {((data.neutral / total) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="border-t pt-1 mt-2">
              <span className="font-medium">Total: {total} mentions</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters?.sentiments?.length > 0) count++;
    if (activeFilters?.sources?.length > 0) count++;
    if (activeFilters?.topics?.length > 0) count++;
    if (activeFilters?.dateRange?.from || activeFilters?.dateRange?.to) count++;
    return count;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment by Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!processedData || processedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment by Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Hash className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No topic data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Sentiment by Topics
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  <Filter className="h-3 w-3 mr-1" />
                  {getActiveFilterCount()} filter
                  {getActiveFilterCount() !== 1 ? "s" : ""}
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Sentiment distribution across different topics
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="total">Sort by Total</option>
              <option value="positive">Sort by Positive</option>
              <option value="negative">Sort by Negative</option>
              <option value="topic">Sort by Topic</option>
            </select>

            <select
              value={showCount}
              onChange={(e) => setShowCount(parseInt(e.target.value))}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={15}>Top 15</option>
              <option value={20}>Top 20</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="topic"
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={11}
                stroke="#666"
              />
              <YAxis stroke="#666" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Bar
                dataKey="positive"
                name="Positive"
                fill="#10b981"
                cursor="pointer"
                onClick={(data) => handleBarClick(data, "positive")}
              />
              <Bar
                dataKey="negative"
                name="Negative"
                fill="#ef4444"
                cursor="pointer"
                onClick={(data) => handleBarClick(data, "negative")}
              />
              <Bar
                dataKey="neutral"
                name="Neutral"
                fill="#6b7280"
                cursor="pointer"
                onClick={(data) => handleBarClick(data, "neutral")}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {processedData.length}
              </div>
              <div className="text-xs text-gray-600">Active Topics</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {processedData.reduce((sum, topic) => sum + topic.positive, 0)}
              </div>
              <div className="text-xs text-gray-600">Positive Mentions</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">
                {processedData.reduce((sum, topic) => sum + topic.negative, 0)}
              </div>
              <div className="text-xs text-gray-600">Negative Mentions</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {processedData.reduce((sum, topic) => sum + topic.total, 0)}
              </div>
              <div className="text-xs text-gray-600">Total Mentions</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { SentimentByTopicsChart };
