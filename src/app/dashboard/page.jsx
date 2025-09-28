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
import { SentimentCard } from "@/components/dashboard/public-mentions/sentiment-card";
import { MetricsCards } from "@/components/dashboard/public-mentions/metrics-cards";
import { SentimentPieChart } from "@/components/dashboard/public-mentions/sentiment-pie-chart";
import { SentimentBySourceChart } from "@/components/dashboard/public-mentions/sentiment-by-source-chart";
import { SentimentAreaChart } from "@/components/dashboard/public-mentions/sentiment-area-chart";
import { MostPopularPosts } from "@/components/dashboard/public-mentions/most-popular-posts";
import Header from "@/components/Header";
import {
  DEFAULT_FILTERS,
  filterUtils,
  SENTIMENT_OPTIONS,
  SOURCE_OPTIONS,
} from "@/lib/types/filters";
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

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // Handle chart clicks for interactive filtering
  const handleChartClick = useCallback(
    (type, value) => {
      let newFilters = { ...filters };

      if (type === "sentiment") {
        const currentSentiments = newFilters.sentiments || [];
        if (currentSentiments.includes(value)) {
          // Remove if already selected
          newFilters.sentiments = currentSentiments.filter((s) => s !== value);
        } else {
          // Add if not selected
          newFilters.sentiments = [...currentSentiments, value];
        }
      } else if (type === "source") {
        const currentSources = newFilters.sources || [];
        if (currentSources.includes(value)) {
          // Remove if already selected
          newFilters.sources = currentSources.filter((s) => s !== value);
        } else {
          // Add if not selected
          newFilters.sources = [...currentSources, value];
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
    isLoadingPopular;

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
        data={metricsData?.data}
        activeFilters={filters}
        isLoading={isLoadingMetrics}
      />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Analysis (Left Column) */}
        <div className="lg:col-span-1">
          <SentimentCard
            data={mentionsData?.data}
            onFilterClick={handleChartClick}
            activeFilters={filters}
            isLoading={isLoadingMentions}
          />
        </div>

        {/* Sentiment Distribution Chart (Right Column) */}
        <div className="lg:col-span-2">
          <SentimentPieChart
            data={mentionsData?.data}
            onChartClick={handleChartClick}
            activeFilters={filters}
            isLoading={isLoadingMentions}
          />
        </div>
      </div>

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
