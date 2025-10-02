"use client";
import React, { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Eye,
  Users,
  Globe,
  Calendar,
  Download,
  Filter,
  Hash,
  Star,
  TrendingDown,
  Smile,
  Frown,
  Meh,
  X,
  ChartAreaIcon,
  Radio,
  RefreshCw,
} from "lucide-react";

// Import optimized hooks
import {
  useRTMMentions,
  useRTMMetrics,
  useRTMTimeline,
  useRTMPlatforms,
  transformRTMData,
  rtmQueryKeys,
} from "@/hooks/useRTMQueries";

// Import components
import SentimentBarChart from "@/components/SentimentBarChart";
import OverallMentionsChart from "@/components/RTMAccount/OverallMentionsChart";
import PlatformDonutChart from "@/components/RTMAccount/PlatformDonutChart";
import PopularMentionsTable from "@/components/RTMAccount/PopularMentionsTable";
import EngagementOverTimeChart from "@/components/RTMAccount/EngagementOverTimeChart";
import PlatformMentionsChart from "@/components/RTMAccount/PlatformMentionsChart";
import ClassificationMentionsChart from "@/components/RTMAccount/ClassificationMentionsChart";
import RTMUnitsPieChart from "@/components/RTMAccount/RTMUnitsPieChart";
import RTMMediaTable from "@/components/RTMAccount/RTMMediaTable";
import EngagementRateChart from "@/components/RTMAccount/EngagementRateChart";
import CalendarDatePicker from "@/components/CalendarDatePicker";
import Header from "@/components/Header";

// Skeleton Loading Component
const SkeletonCard = ({ className = "" }) => (
  <Card className={className}>
    <CardHeader>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
    </CardHeader>
  </Card>
);

// RTMTabs Component (optimized)
const RTMTabs = ({ onFilterChange, activeTab, setActiveTab }) => {
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    onFilterChange("unit", tabId === "overall" ? null : tabId);
  };

  const tabs = [
    { id: "overall", label: "RTM Overall" },
    { id: "official", label: "RTM Official Account" },
    { id: "tv", label: "TV" },
    { id: "berita", label: "Berita" },
    { id: "radio", label: "Radio" },
  ];

  return (
    <div className="w-full flex justify-center">
      <div className="w-full">
        <div className="h-12 items-center justify-center rounded-xl bg-white p-1.5 text-slate-500 shadow-sm border border-slate-200 backdrop-blur-sm grid grid-cols-5 w-full max-w-full">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 lg:px-4 py-2.5 text-xs lg:text-sm font-medium transition-all flex-1 ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Active Filters Display Component
const ActiveFilters = ({ filters, onRemoveFilter, onClearAll }) => {
  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => value !== null && value !== undefined && value !== ""
  );

  if (activeFilters.length === 0) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Active Filters</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(([key, value]) => (
            <Badge
              key={key}
              variant="outline"
              className="flex items-center gap-1"
            >
              {key}: {value}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onRemoveFilter(key)}
              />
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const RTMDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overall");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date("2025-08-01"),
    to: new Date("2025-09-17"),
  });

  // Global filter state
  const [globalFilters, setGlobalFilters] = useState({
    sentiment: null,
    platform: null,
    category: null,
    unit: null,
    author: null,
  });

  // Compute filter object for queries
  const queryFilters = useMemo(() => {
    const daysDiff = Math.ceil(
      (selectedDateRange.to - selectedDateRange.from) / (1000 * 60 * 60 * 24)
    );

    return {
      days: daysDiff.toString(),
      from: selectedDateRange.from.toISOString(),
      to: selectedDateRange.to.toISOString(),
      platform: selectedPlatform !== "all" ? selectedPlatform : "",
      // Remove filters that are handled client-side to prevent unnecessary API calls
      sentiment: "", // Handle client-side for better performance
      unit: "", // Handle client-side for better performance
      category: "", // Handle client-side for better performance
      author: "", // Handle client-side for better performance
    };
  }, [selectedDateRange, selectedPlatform]); // Remove globalFilters dependency

  // Single optimized data fetch
  const {
    data: dashboardData,
    isLoading: isLoadingData,
    error: dataError,
  } = useRTMMentions(queryFilters); // This now uses the optimized single call

  // Extract data from single response
  const rawMentionsData = dashboardData;
  const metricsData = dashboardData?.metrics;
  const timelineData = dashboardData?.timeSeries;
  const platformsData = dashboardData?.platforms;

  // Single loading state
  const isLoading = isLoadingData;

  // Transform and filter data efficiently
  const { transformedData, filteredData } = useMemo(() => {
    if (!rawMentionsData?.mentions)
      return { transformedData: [], filteredData: [] };

    // Transform data only once
    const transformed = transformRTMData(rawMentionsData);

    // Quick return if no filters
    const hasActiveFilters = Object.values(globalFilters).some(Boolean);
    if (!hasActiveFilters) {
      return { transformedData: transformed, filteredData: transformed };
    }

    // Optimized filtering with early returns
    const filtered = transformed.filter((item) => {
      // Unit filter (most common)
      if (globalFilters.unit) {
        const unit = globalFilters.unit;
        if (unit === "overall") return true;
        if (unit === "official") {
          if (
            !(
              item.unit === "Official" ||
              item.isInfluencer ||
              item.followerCount > 50000
            )
          )
            return false;
        } else if (unit === "tv") {
          if (
            !(
              item.unit === "TV" ||
              item.unit?.toLowerCase().includes("tv") ||
              item.platform === "YouTube"
            )
          )
            return false;
        } else if (unit === "berita") {
          if (
            !(
              item.unit === "News" ||
              item.unit?.toLowerCase().includes("news") ||
              item.unit?.toLowerCase().includes("berita")
            )
          )
            return false;
        } else if (unit === "radio") {
          if (
            !(
              item.unit === "Radio" ||
              item.unit?.toLowerCase().includes("radio")
            )
          )
            return false;
        }
      }

      // Other filters (exact matches for performance)
      if (globalFilters.sentiment && item.sentiment !== globalFilters.sentiment)
        return false;
      if (globalFilters.platform && item.platform !== globalFilters.platform)
        return false;
      if (globalFilters.category && item.category !== globalFilters.category)
        return false;
      if (globalFilters.author && item.author !== globalFilters.author)
        return false;

      return true;
    });

    return { transformedData: transformed, filteredData: filtered };
  }, [rawMentionsData, globalFilters]);

  // Create mentions over time data
  const mentionsOverTime = useMemo(() => {
    const groupedByDate = {};

    filteredData.forEach((item) => {
      const date = item.date;
      if (!groupedByDate[date]) {
        groupedByDate[date] = {
          date,
          facebook: 0,
          instagram: 0,
          twitter: 0,
          tiktok: 0,
          youtube: 0,
          reddit: 0,
          linkedin: 0,
        };
      }

      const platformKey = item.platform.toLowerCase();
      if (groupedByDate[date][platformKey] !== undefined) {
        groupedByDate[date][platformKey]++;
      }
    });

    return Object.values(groupedByDate).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [filteredData]);

  // Filter handlers with debouncing for better performance
  const handleGlobalFilterChange = (filterType, filterValue) => {
    setGlobalFilters((prev) => ({
      ...prev,
      [filterType]: filterValue === prev[filterType] ? null : filterValue,
    }));
  };

  const handleRemoveFilter = (filterType) => {
    setGlobalFilters((prev) => ({
      ...prev,
      [filterType]: null,
    }));
  };

  const handleClearAllFilters = () => {
    setGlobalFilters({
      sentiment: null,
      platform: null,
      category: null,
      unit: null,
      author: null,
    });
    setActiveTab("overall");
  };

  const handleDateRangeChange = (newDateRange) => {
    setSelectedDateRange(newDateRange);
  };

  // Refresh data
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: rtmQueryKeys.all });
  };

  // Calculate metrics
  const totalMentions = filteredData.length;
  const totalEngagements = filteredData.reduce(
    (sum, item) => sum + item.interactions,
    0
  );
  const totalReach = filteredData.reduce((sum, item) => sum + item.reach, 0);

  const positiveMentions = filteredData.filter(
    (d) => d.sentiment === "positive"
  ).length;
  const negativeMentions = filteredData.filter(
    (d) => d.sentiment === "negative"
  ).length;

  const positiveRatio =
    totalMentions > 0 ? positiveMentions / totalMentions : 0;
  const negativeRatio =
    totalMentions > 0 ? negativeMentions / totalMentions : 0;

  let overallSentiment = "neutral";
  if (positiveRatio > 0.5) {
    overallSentiment = "positive";
  } else if (negativeRatio > 0.4) {
    overallSentiment = "negative";
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  const exportData = () => {
    // Implement export functionality
    const dataToExport = {
      totalMentions,
      totalEngagements,
      totalReach,
      data: filteredData,
      dateRange: selectedDateRange,
      filters: globalFilters,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rtm-dashboard-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Loading state (using single source)
  // const isLoading = isLoadingMentions || isLoadingMetrics || isLoadingTimeline; // Removed duplicate

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Header />
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Loading RTM Social Media Dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Header />
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle className="text-red-600">
              Error Loading Dashboard
            </CardTitle>
            <CardDescription>{dataError.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header with Controls */}
      <Header />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            RTM Social Media Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring across Radio, TV, and Berita social channels
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Showing {formatNumber(totalMentions)} mentions from selected date
            range (
            {Math.ceil(
              (selectedDateRange.to - selectedDateRange.from) /
                (1000 * 60 * 60 * 24)
            )}{" "}
            days)
          </p>
        </div>

        <ActiveFilters
          filters={globalFilters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        />

        {/* Controls */}
        <div className="flex gap-2 flex-wrap items-center">
          <CalendarDatePicker
            selectedDateRange={selectedDateRange}
            onDateRangeChange={handleDateRangeChange}
          />

          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-36">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
              <SelectItem value="TikTok">TikTok</SelectItem>
              <SelectItem value="YouTube">YouTube</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Mentions
                </CardTitle>
                <MessageSquare className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatNumber(totalMentions)}
                </div>
                <p className="text-xs mt-1">Across all platforms</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Engagements
                </CardTitle>
                <ThumbsUp className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatNumber(totalEngagements)}
                </div>
                <p className="text-xs mt-1">Likes, shares, comments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Reach
                </CardTitle>
                <Eye className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatNumber(totalReach)}
                </div>
                <p className="text-xs mt-1">People reached</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Channels by Unit
                </CardTitle>
                <Radio className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                {(() => {
                  const channelsByUnit = filteredData.reduce((acc, item) => {
                    if (!acc[item.unit]) {
                      acc[item.unit] = new Set();
                    }
                    acc[item.unit].add(item.author);
                    return acc;
                  }, {});

                  const allUnits = ["TV", "Radio", "News", "Official"];
                  const unitsData = allUnits.map((unit) => ({
                    unit: unit.toLowerCase(),
                    count: channelsByUnit[unit] ? channelsByUnit[unit].size : 0,
                  }));

                  return (
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center">
                        <span className="text-xs text-gray-600">Official</span>
                        <div className="text-lg font-semibold">
                          {unitsData[3].count}
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-gray-600">TV</span>
                        <div className="text-lg font-semibold">
                          {unitsData[0].count}
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-gray-600">News</span>
                        <div className="text-lg font-semibold">
                          {unitsData[2].count}
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-gray-600">Radio</span>
                        <div className="text-lg font-semibold">
                          {unitsData[1].count}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* RTM Media Table */}
      <div className="grid gap-6 lg:grid-cols-1">
        {isLoading ? (
          <SkeletonCard className="h-96" />
        ) : (
          <RTMMediaTable
            data={filteredData}
            selectedTab={activeTab}
            onFilterChange={handleGlobalFilterChange}
          />
        )}
      </div>

      {/* RTM Tabs */}
      <div className="grid gap-6 lg:grid-cols-1">
        <RTMTabs
          onFilterChange={handleGlobalFilterChange}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Platform and Units Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          <>
            <SkeletonCard className="h-96" />
            <SkeletonCard className="h-96" />
          </>
        ) : (
          <>
            <Card>
              <PlatformDonutChart
                data={filteredData}
                onFilterChange={handleGlobalFilterChange}
                activeFilters={globalFilters}
              />
            </Card>
            <Card>
              <RTMUnitsPieChart
                data={filteredData}
                onFilterChange={handleGlobalFilterChange}
                activeFilters={globalFilters}
              />
            </Card>
          </>
        )}
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          <>
            <SkeletonCard className="h-96" />
            <SkeletonCard className="h-96" />
          </>
        ) : (
          <>
            <Card>
              <PlatformMentionsChart
                data={filteredData}
                onFilterChange={handleGlobalFilterChange}
              />
            </Card>
            <Card>
              <EngagementRateChart
                data={filteredData}
                onFilterChange={handleGlobalFilterChange}
              />
            </Card>
          </>
        )}
      </div>

      {/* Timeline Charts */}
      <div className="grid gap-6 lg:grid-cols-1">
        {isLoading ? (
          <SkeletonCard className="h-96" />
        ) : (
          <Card>
            <OverallMentionsChart
              mentionsOverTime={mentionsOverTime}
              onFilterChange={handleGlobalFilterChange}
            />
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {isLoading ? (
          <SkeletonCard className="h-96" />
        ) : (
          <Card>
            <EngagementOverTimeChart
              data={filteredData}
              onFilterChange={handleGlobalFilterChange}
            />
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {isLoading ? (
          <SkeletonCard className="h-96" />
        ) : (
          <Card>
            <ClassificationMentionsChart
              data={filteredData}
              onFilterChange={handleGlobalFilterChange}
            />
          </Card>
        )}
      </div>

      {/* Popular Mentions Table */}
      <div className="grid gap-6 lg:grid-cols-1">
        {isLoading ? (
          <SkeletonCard className="h-96" />
        ) : (
          <Card>
            <PopularMentionsTable
              data={filteredData}
              onFilterChange={handleGlobalFilterChange}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default RTMDashboard;
