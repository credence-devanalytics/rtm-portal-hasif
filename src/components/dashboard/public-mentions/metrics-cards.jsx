import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Eye, Heart } from "lucide-react";

const MetricsCards = ({ data, activeFilters, isLoading }) => {
  // Get metrics data with defaults
  const metricsData = {
    totalPosts: data?.totalPosts || data?.totalMentions || 0,
    totalReach: data?.totalReach || 0,
    totalInteractions: data?.totalInteractions || 0,
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Posts Card */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatNumber(metricsData.totalPosts)}
          </div>
          <p className="text-xs text-muted-foreground">
            {getConditionalText()}
          </p>
          <div className="text-xs text-blue-600 mt-1">
            {metricsData.totalPosts.toLocaleString()} total mentions
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
            {formatNumber(metricsData.totalReach)}
          </div>
          <p className="text-xs text-muted-foreground">
            Audience reached {getConditionalText()}
          </p>
          <div className="text-xs text-green-600 mt-1">
            {metricsData.totalReach.toLocaleString()} total impressions
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
            {formatNumber(metricsData.totalInteractions)}
          </div>
          <p className="text-xs text-muted-foreground">
            Likes, shares & comments {getConditionalText()}
          </p>
          <div className="text-xs text-purple-600 mt-1">
            {metricsData.totalInteractions.toLocaleString()} total engagements
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { MetricsCards };
