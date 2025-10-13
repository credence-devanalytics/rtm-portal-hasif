"use client";

import { useState, useMemo } from "react";
import { MentionsFilterBar } from "@/components/ai/MentionsFilterBar";
import { MentionsGrid } from "@/components/ai/MentionsGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  MessageSquare,
  Heart,
  Eye,
  BarChart3,
} from "lucide-react";
import { usePublicMentions } from "@/hooks/useQueries";

// Helper function to format large numbers
function formatNumber(num?: number) {
  if (!num || num === 0) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

export default function RecommendationPage() {
  // State for filters
  const [filters, setFilters] = useState({
    days: 30,
    platform: undefined,
    sentiment: undefined,
    topic: undefined,
  });

  // Memoize filter updates to prevent unnecessary re-renders
  const handleFiltersChange = useMemo(
    () => (newFilters: typeof filters) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  // Clean the filters for API calls
  const cleanFilters = {
    days: filters.days,
    platform: filters.platform && filters.platform !== 'all' ? filters.platform : undefined,
    sentiment: filters.sentiment && filters.sentiment !== 'all' ? filters.sentiment : undefined,
    topic: filters.topic && filters.topic !== 'all' && filters.topic !== 'undefined' ? filters.topic : undefined,
  };

  // Fetch metrics data
  const { data: metricsData, isLoading: metricsLoading, error, isError } = usePublicMentions(cleanFilters);

  // Debug logging
  console.log('=== Frontend Debug ===');
  console.log('Filters:', filters);
  console.log('Clean filters:', cleanFilters);
  console.log('Clean filters truthy:', !!cleanFilters);
  console.log('Metrics data:', metricsData);
  console.log('Metrics loading:', metricsLoading);
  console.log('Metrics error:', error);
  console.log('Metrics is error:', isError);
  console.log('=====================');

  return (
    <div className="pt-16 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Recommendations
        </h1>
        <p className="text-gray-600">
          Discover trending mentions and conversations powered by AI analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Filters */}
        <div className="lg:col-span-1">
          <MentionsFilterBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            className="sticky top-20"
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Mentions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="">
                {metricsLoading ? (
                  <Skeleton className="h-8 w-20 mb-2" />
                ) : (
                  <div className="text-2xl font-bold mb-2">
                    {metricsData?.metrics?.totalMentions?.toLocaleString() || 0}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  In selected time range
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="">
                {metricsLoading ? (
                  <Skeleton className="h-8 w-20 mb-2" />
                ) : (
                  <div className="text-2xl font-bold mb-2">
                    {formatNumber(metricsData?.metrics?.totalReach) || 0}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Potential audience
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="">
                {metricsLoading ? (
                  <Skeleton className="h-8 w-20 mb-2" />
                ) : (
                  <div className="text-2xl font-bold mb-2">
                    {formatNumber(metricsData?.metrics?.totalInteractions) || 0}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Total interactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="">
                {metricsLoading ? (
                  <Skeleton className="h-8 w-16 mb-2" />
                ) : (
                  <div className="text-2xl font-bold mb-2">
                    {((metricsData?.metrics?.avgEngagement || 0) * 100).toFixed(1)}%
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Engagement rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* View Tabs */}
          <Tabs defaultValue="mentions" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mentions" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Mentions
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                {filters.platform && (
                  <Badge variant="outline" className="text-xs">
                    Platform: {filters.platform}
                  </Badge>
                )}
                {filters.sentiment && (
                  <Badge variant="outline" className="text-xs">
                    Sentiment: {filters.sentiment}
                  </Badge>
                )}
                {filters.topic && (
                  <Badge variant="outline" className="text-xs">
                    Topic: {filters.topic}
                  </Badge>
                )}
              </div>
            </div>

            <TabsContent value="mentions" className="mt-0">
              <MentionsGrid filters={filters} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <Card>
                <CardHeader className="">
                  <CardTitle className="">Analytics Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="">
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Analytics Coming Soon
                    </h3>
                    <p className="text-gray-500">
                      Advanced analytics and insights will be available here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
