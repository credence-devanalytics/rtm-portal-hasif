import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Eye, Heart, Smile, Frown, Meh } from "lucide-react";
import { cn } from "@/lib/utils";

const MetricsCards = ({
  data,
  metricsData,
  activeFilters,
  isLoading,
  onFilterClick,
}) => {
  // Get metrics data with defaults - use metricsData if provided, fallback to data
  const metrics = {
    totalPosts:
      metricsData?.totalPosts || data?.totalPosts || data?.totalMentions || 0,
    totalReach: metricsData?.totalReach || data?.totalReach || 0,
    totalInteractions:
      metricsData?.totalInteractions || data?.totalInteractions || 0,
  };

  // Get sentiment data with defaults
  const sentimentData = {
    positive: data?.positive || 0,
    negative: data?.negative || 0,
    neutral: data?.neutral || 0,
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

  // Calculate total and percentages for sentiment
  const total =
    sentimentData.positive + sentimentData.negative + sentimentData.neutral;

  const getPercentage = (value) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  // Check if sentiment is in active filters
  const isActive = (sentiment) => {
    return activeFilters?.sentiments?.includes(sentiment) || false;
  };

  // Handle sentiment card click for filtering
  const handleSentimentClick = (sentiment) => {
    console.log("Sentiment clicked:", sentiment); // Debug log
    console.log("onFilterClick exists:", !!onFilterClick); // Debug log
    if (onFilterClick) {
      onFilterClick("sentiment", sentiment);
    }
  };

  // Get conditional text based on active filters
  const getConditionalText = () => {
    const hasFilters =
      activeFilters &&
      (activeFilters.sentiments?.length > 0 ||
        activeFilters.sources?.length > 0 ||
        activeFilters.dateRange?.from ||
        activeFilters.dateRange?.to);

    if (hasFilters) {
      return "for filtered results";
    }
    return "across all platforms";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="w-24 h-4 bg-gray-200 animate-pulse rounded" />
              <div className="w-4 h-4 bg-gray-200 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded mb-1" />
              <div className="w-32 h-3 bg-gray-200 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Posts Card */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatNumber(metrics.totalPosts)}
          </div>
          <p className="text-xs text-muted-foreground">
            {getConditionalText()}
          </p>
          <div className="text-xs text-blue-600 mt-1">
            {metrics.totalPosts.toLocaleString()} total mentions
          </div>
        </CardContent>
      </Card>

      {/* Total Reach Card */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(metrics.totalReach)}
          </div>
          <p className="text-xs text-muted-foreground">
            Audience reached {getConditionalText()}
          </p>
          <div className="text-xs text-green-600 mt-1">
            {metrics.totalReach.toLocaleString()} total impressions
          </div>
        </CardContent>
      </Card>

      {/* Total Interactions Card */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Interactions
          </CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {formatNumber(metrics.totalInteractions)}
          </div>
          <p className="text-xs text-muted-foreground">
            Likes, shares & comments {getConditionalText()}
          </p>
          <div className="text-xs text-purple-600 mt-1">
            {metrics.totalInteractions.toLocaleString()} total engagements
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Analysis Card */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Sentiment Analysis
          </CardTitle>
          <Smile className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 justify-between">
            {/* Positive */}
            <div
              className={cn(
                "flex flex-col items-center p-2 rounded cursor-pointer transition-all flex-1",
                isActive("positive")
                  ? "bg-green-100 ring-1 ring-green-300"
                  : "hover:bg-green-50"
              )}
              onClick={() => handleSentimentClick("positive")}
            >
              <div className="flex items-center gap-1 mb-1">
                <Smile className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  Positive
                </span>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-green-700">
                  {formatNumber(sentimentData.positive)}
                </div>
                <div className="text-xs text-green-600">
                  {getPercentage(sentimentData.positive)}%
                </div>
              </div>
            </div>

            {/* Negative */}
            <div
              className={cn(
                "flex flex-col items-center p-2 rounded cursor-pointer transition-all flex-1",
                isActive("negative")
                  ? "bg-red-100 ring-1 ring-red-300"
                  : "hover:bg-red-50"
              )}
              onClick={() => handleSentimentClick("negative")}
            >
              <div className="flex items-center gap-1 mb-1">
                <Frown className="h-4 w-4 text-red-600" />
                <span className="text-xs font-medium text-red-700">
                  Negative
                </span>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-red-700">
                  {formatNumber(sentimentData.negative)}
                </div>
                <div className="text-xs text-red-600">
                  {getPercentage(sentimentData.negative)}%
                </div>
              </div>
            </div>

            {/* Neutral */}
            <div
              className={cn(
                "flex flex-col items-center p-2 rounded cursor-pointer transition-all flex-1",
                isActive("neutral")
                  ? "bg-gray-100 ring-1 ring-gray-300"
                  : "hover:bg-gray-50"
              )}
              onClick={() => handleSentimentClick("neutral")}
            >
              <div className="flex items-center gap-1 mb-1">
                <Meh className="h-4 w-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">
                  Neutral
                </span>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-gray-700">
                  {formatNumber(sentimentData.neutral)}
                </div>
                <div className="text-xs text-gray-600">
                  {getPercentage(sentimentData.neutral)}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { MetricsCards };
