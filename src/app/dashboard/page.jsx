/**
 * Enhanced Social Media Mentions Dashboard
 * Integrates all dashboard components with filtering and state management
 */

"use client";

import React, { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterControls } from "@/components/FilterControls";
import { MetricsCards } from "@/components/dashboard/public-mentions/metrics-cards";
import { SentimentBySourceChart } from "@/components/dashboard/public-mentions/sentiment-by-source-chart";
import { SentimentAreaChart } from "@/components/dashboard/public-mentions/sentiment-area-chart";
import { MostPopularPosts } from "@/components/dashboard/public-mentions/most-popular-posts";
import { SentimentByTopicsChart } from "@/components/dashboard/charts/sentiment-by-topics-chart";
import EngagementRateChart from "@/components/dashboard/public-mentions/engagement-rate-chart";
import TopAuthorsTable from "@/components/dashboard/public-mentions/top-authors-table";
import Header from "@/components/Header";
import {
  DEFAULT_FILTERS,
  filterUtils,
  SENTIMENT_OPTIONS,
  SOURCE_OPTIONS,
} from "@/lib/types/filters";
import { useSentimentByTopics } from "@/hooks/useQueries";
import {
  RefreshCw,
  Download,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

// Query keys
const QUERY_KEYS = {
  socialMediaMentions: (filters) => ["social-media", "mentions", filters],
  socialMediaMetrics: (filters) => ["social-media", "metrics", filters],
  sentimentBySource: (filters) => [
    "social-media",
    "sentiment-by-source",
    filters,
  ],
  sentimentTimeline: (filters) => [
    "social-media",
    "sentiment-timeline",
    filters,
  ],
  popularPosts: (filters) => ["social-media", "popular-posts", filters],
  topAuthors: (filters) => ["social-media", "top-authors", filters],
  engagementRate: (filters) => ["social-media", "engagement-rate", filters],
};

// API fetch functions
const fetchSocialMediaData = async (filters) => {
  const params = filterUtils.toUrlParams(filters);
  const response = await fetch(`/api/social-media/public_mentions?${params}`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch social media data: ${response.statusText}`
    );
  }
  return response.json();
};

const fetchMetricsData = async (filters) => {
  const params = filterUtils.toUrlParams(filters);
  const response = await fetch(`/api/social-media/metrics?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`);
  }
  return response.json();
};

const fetchSentimentBySource = async (filters) => {
  const params = filterUtils.toUrlParams(filters);
  const response = await fetch(
    `/api/social-media/sentiment-by-source?${params}`
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch sentiment by source: ${response.statusText}`
    );
  }
  return response.json();
};

const fetchSentimentTimeline = async (filters) => {
  const params = filterUtils.toUrlParams(filters);
  const response = await fetch(
    `/api/social-media/sentiment-timeline?${params}`
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch sentiment timeline: ${response.statusText}`
    );
  }
  return response.json();
};

const fetchPopularPosts = async (filters) => {
  const params = filterUtils.toUrlParams(filters);
  const response = await fetch(`/api/social-media/popular-posts?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch popular posts: ${response.statusText}`);
  }
  return response.json();
};

const fetchTopAuthors = async (filters) => {
  const params = filterUtils.toUrlParams(filters);
  const response = await fetch(`/api/social-media/top-authors?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch top authors: ${response.statusText}`);
  }
  return response.json();
};

const fetchEngagementRate = async (filters) => {
  const params = filterUtils.toUrlParams(filters);
  const response = await fetch(`/api/social-media/engagement-rate?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch engagement rate: ${response.statusText}`);
  }
  return response.json();
};

const SocialMediaDashboard = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const queryClient = useQueryClient();

  // Data queries
  const {
    data: mentionsData,
    isLoading: isLoadingMentions,
    error: mentionsError,
  } = useQuery({
    queryKey: QUERY_KEYS.socialMediaMentions(filters),
    queryFn: () => fetchSocialMediaData(filters),
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });

  const { data: metricsData, isLoading: isLoadingMetrics } = useQuery({
    queryKey: QUERY_KEYS.socialMediaMetrics(filters),
    queryFn: () => fetchMetricsData(filters),
    staleTime: 30 * 1000,
    retry: 2,
  });

  const { data: sentimentBySourceData, isLoading: isLoadingBySource } =
    useQuery({
      queryKey: QUERY_KEYS.sentimentBySource(filters),
      queryFn: () => fetchSentimentBySource(filters),
      staleTime: 30 * 1000,
      retry: 2,
    });

  const { data: sentimentTimelineData, isLoading: isLoadingTimeline } =
    useQuery({
      queryKey: QUERY_KEYS.sentimentTimeline(filters),
      queryFn: () => fetchSentimentTimeline(filters),
      staleTime: 30 * 1000,
      retry: 2,
    });

  const { data: popularPostsData, isLoading: isLoadingPopular } = useQuery({
    queryKey: QUERY_KEYS.popularPosts(filters),
    queryFn: () => fetchPopularPosts(filters),
    staleTime: 30 * 1000,
    retry: 2,
  });

  const { data: topAuthorsData, isLoading: isLoadingTopAuthors } = useQuery({
    queryKey: QUERY_KEYS.topAuthors(filters),
    queryFn: () => fetchTopAuthors(filters),
    staleTime: 30 * 1000,
    retry: 2,
  });

  const {
    data: engagementRateData,
    isLoading: isLoadingEngagement,
    error: engagementError,
  } = useQuery({
    queryKey: QUERY_KEYS.engagementRate(filters),
    queryFn: () => fetchEngagementRate(filters),
    staleTime: 30 * 1000,
    retry: 2,
  });

  // Log engagement data for debugging
  React.useEffect(() => {
    if (engagementRateData) {
      console.log("📊 Engagement Rate Data:", engagementRateData);
    }
    if (engagementError) {
      console.error("❌ Engagement Rate Error:", engagementError);
    }
  }, [engagementRateData, engagementError]);

  // Sentiment by Topics data
  const {
    data: sentimentByTopicsData,
    isLoading: isLoadingByTopics,
    error: topicsError,
  } = useSentimentByTopics(filters, {
    refetchInterval: 30000,
  });

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // Handle chart clicks for interactive filtering
  const handleChartClick = useCallback(
    (clickDataOrType, value) => {
      let newFilters = { ...filters };

      // Handle different click types
      if (typeof clickDataOrType === "string") {
        // Two-parameter calls: type and value
        const type = clickDataOrType;

        if (type === "sentiment") {
          const currentSentiments = newFilters.sentiments || [];
          if (currentSentiments.includes(value)) {
            newFilters.sentiments = currentSentiments.filter(
              (s) => s !== value
            );
          } else {
            newFilters.sentiments = [...currentSentiments, value];
          }
        } else if (type === "source") {
          const currentSources = newFilters.sources || [];
          if (currentSources.includes(value)) {
            newFilters.sources = currentSources.filter((s) => s !== value);
          } else {
            newFilters.sources = [...currentSources, value];
          }
        }
      } else if (clickDataOrType && typeof clickDataOrType === "object") {
        // New object-based clicks
        const clickData = clickDataOrType;

        if (clickData.type === "topic-sentiment") {
          // Handle topic clicks
          const currentTopics = newFilters.topics || [];
          if (currentTopics.includes(clickData.topic)) {
            newFilters.topics = currentTopics.filter(
              (t) => t !== clickData.topic
            );
          } else {
            newFilters.topics = [...currentTopics, clickData.topic];
          }

          // Also handle sentiment filter if specified
          if (clickData.sentiment) {
            const currentSentiments = newFilters.sentiments || [];
            if (currentSentiments.includes(clickData.sentiment)) {
              newFilters.sentiments = currentSentiments.filter(
                (s) => s !== clickData.sentiment
              );
            } else {
              newFilters.sentiments = [
                ...currentSentiments,
                clickData.sentiment,
              ];
            }
          }
        }
      }

      setFilters(newFilters);
    },
    [filters]
  );

  // Handle post click
  const handlePostClick = useCallback((post) => {
    console.log("Post clicked:", post);
    // Could open a modal or navigate to post details
  }, []);

  // Refresh all data
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["social-media"] });
  }, [queryClient]);

  // Export functionality (placeholder)
  const handleExport = useCallback(() => {
    console.log("Export functionality would be implemented here");
    // Could export to CSV, PDF, etc.
  }, []);

  // Check if any data is loading
  const isLoading =
    isLoadingMentions ||
    isLoadingMetrics ||
    isLoadingBySource ||
    isLoadingTimeline ||
    isLoadingPopular ||
    isLoadingTopAuthors ||
    isLoadingByTopics ||
    isLoadingEngagement;

  // Get active filter count
  const activeFilterCount = filterUtils.getActiveFilterCount(filters);

  // Get date range display
  const getDateRangeDisplay = () => {
    if (filters.dateRange.from && filters.dateRange.to) {
      return `${filters.dateRange.from} to ${filters.dateRange.to}`;
    } else if (filters.dateRange.from) {
      return `From ${filters.dateRange.from}`;
    } else if (filters.dateRange.to) {
      return `Until ${filters.dateRange.to}`;
    }
    return "All time";
  };

  if (mentionsError) {
    return (
      <div className="container mx-auto p-6">
        <Header />
        <div className="pt-20">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Error Loading Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 mb-4">{mentionsError.message}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Header />

      {/* Dashboard Header */}
      <div className="pt-10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Social Media Mentions Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time analytics for social media mentions with interactive
              filtering
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 p-4 rounded-lg">
          <FilterControls
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{getDateRangeDisplay()}</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}{" "}
                active
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <MetricsCards
        data={mentionsData?.data}
        metricsData={metricsData?.data}
        activeFilters={filters}
        isLoading={isLoadingMentions || isLoadingMetrics}
        onFilterClick={handleChartClick}
      />

      {/* Sentiment by Platform Chart */}
      <SentimentBySourceChart
        data={sentimentBySourceData?.data}
        onChartClick={handleChartClick}
        activeFilters={filters}
        isLoading={isLoadingBySource}
      />

      {/* Timeline Chart */}
      <SentimentAreaChart
        data={sentimentTimelineData?.data}
        onChartClick={handleChartClick}
        activeFilters={filters}
        isLoading={isLoadingTimeline}
      />

      {/* Sentiment by Topics Chart */}
      <SentimentByTopicsChart
        data={sentimentByTopicsData?.data}
        onChartClick={handleChartClick}
        activeFilters={filters}
        isLoading={isLoadingByTopics}
      />

      {/* Engagement Rate by Platform Chart */}
      <EngagementRateChart
        data={engagementRateData?.data}
        onChartClick={handleChartClick}
        activeFilters={filters}
        isLoading={isLoadingEngagement}
      />

      {/* Top Authors Table */}
      <TopAuthorsTable
        data={topAuthorsData?.data}
        activeFilters={filters}
        isLoading={isLoadingTopAuthors}
      />

      {/* Popular Posts */}
      <MostPopularPosts
        data={popularPostsData?.data}
        onPostClick={handlePostClick}
        activeFilters={filters}
        isLoading={isLoadingPopular}
      />

      {/* Dashboard Footer Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                Dashboard Status
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-blue-700">
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
              <span>Data source: Real-time API</span>
              <span>Response time: &lt;30s</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaDashboard;
