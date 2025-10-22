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
    <CardHeader className="">
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
        <div className="h-12 items-center justify-center rounded-xl bg-white p-1 text-slate-500 shadow-sm border border-black  backdrop-blur-sm grid grid-cols-5 w-full max-w-full">
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
              {key}: {String(value)}
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
  const [selectedDateRange, setSelectedDateRange] = useState(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return {
      from: thirtyDaysAgo,
      to: today,
    };
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
      (Number(selectedDateRange.to) - Number(selectedDateRange.from)) /
        (1000 * 60 * 60 * 24)
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
      author: globalFilters.author || "", // FIXED: Send author to API for filtering
    };
  }, [selectedDateRange, selectedPlatform, globalFilters.author]); // Add globalFilters.author dependency

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
  const platformByUnitData = dashboardData?.platformByUnit; // Platform distribution per unit
  const unitsData = dashboardData?.units; // Unit breakdown from database
  const channelsData = dashboardData?.channels; // Channel breakdown from database
  const authorsData = dashboardData?.authorsData; // Author breakdown from database

  // Debug logging
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("� DASHBOARD DATA RECEIVED");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. Query Filters:", queryFilters);
  console.log("2. Global Filters:", globalFilters);
  console.log("3. Raw mentions count:", dashboardData?.mentions?.length);
  console.log("4. Metrics:", metricsData);
  console.log(
    "5. Has platformByUnitData:",
    !!platformByUnitData,
    platformByUnitData?.length
  );
  console.log("6. Has unitsData:", !!unitsData, unitsData?.length);
  console.log("7. Has channelsData:", !!channelsData, channelsData?.length);
  console.log("8. Has authorsData:", !!authorsData, authorsData?.length);
  if (authorsData && authorsData.length > 0) {
    console.log(
      "9. Top 10 authors in authorsData:",
      authorsData.slice(0, 10).map((a: any) => ({
        author: a.author,
        count: a.count,
        unit: a.unit,
      }))
    );
  }
  console.log(
    "10. Sample mentions (first 3):",
    dashboardData?.mentions?.slice(0, 3)
  );
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Single loading state
  const isLoading = isLoadingData;

  // Transform and filter data efficiently
  const { transformedData, filteredData } = useMemo(() => {
    if (!rawMentionsData?.mentions)
      return { transformedData: [], filteredData: [] };

    // Transform data only once
    const transformed = transformRTMData(rawMentionsData);
    console.log("📊 Transformed data count:", transformed.length);

    // Debug: Check platform format in transformed data
    if (transformed.length > 0) {
      console.log(
        "🔍 Sample platform values:",
        transformed.slice(0, 3).map((d) => d.platform)
      );
    }

    // Check if there are any non-unit filters active
    const hasActiveFilters = Object.entries(globalFilters)
      .filter(([key]) => key !== "unit") // Exclude unit filter for this check
      .some(([, value]) => Boolean(value));

    // Check if unit filter is active
    const hasUnitFilter =
      globalFilters.unit && globalFilters.unit !== "overall";

    // If no filters at all (including unit), return all data
    if (!hasActiveFilters && !hasUnitFilter) {
      console.log("✅ No active filters, showing all data");
      return { transformedData: transformed, filteredData: transformed };
    }

    console.log("🔎 Active filters:", globalFilters);

    // Optimized filtering with early returns
    const filtered = transformed.filter((item) => {
      // Unit filter (most common) - ALWAYS process this first
      if (globalFilters.unit) {
        const unit = globalFilters.unit;
        if (unit === "overall") {
          // Show all data
          return true;
        } else if (unit === "official") {
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
        } else {
          // Handle any other unit values with exact match (case-insensitive)
          if (item.unit?.toLowerCase() !== unit.toLowerCase()) {
            return false;
          }
        }
      }

      // Other filters (exact matches for performance)
      if (globalFilters.sentiment && item.sentiment !== globalFilters.sentiment)
        return false;
      if (globalFilters.platform && item.platform !== globalFilters.platform)
        return false;
      if (globalFilters.category && item.category !== globalFilters.category)
        return false;
      if (globalFilters.author && item.author !== globalFilters.author) {
        // Debug author filtering
        if (transformed.indexOf(item) < 5) {
          // Only log first 5 to avoid spam
          console.log(
            `   ❌ Author mismatch: "${item.author}" !== "${globalFilters.author}"`
          );
        }
        return false;
      }

      return true;
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 FILTERING RESULTS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1. Transformed count:", transformed.length);
    console.log("2. Filtered count:", filtered.length);
    console.log("3. Applied filters:", globalFilters);
    if (filtered.length > 0) {
      console.log(
        "4. Sample filtered items (first 3):",
        filtered.slice(0, 3).map((f) => ({
          author: f.author,
          platform: f.platform,
          date: f.date,
        }))
      );
    }
    if (filtered.length === 0 && transformed.length > 0) {
      const uniqueAuthors = [...new Set(transformed.map((t) => t.author))];
      console.log(
        "4. ⚠️ NO MATCHES! All unique authors in data:",
        uniqueAuthors
      );
      console.log("5. Looking for:", globalFilters.author);
      console.log(
        "6. Does data contain this author?",
        uniqueAuthors.includes(globalFilters.author)
      );

      // Check for similar author names
      if (globalFilters.author) {
        const searchTerm = globalFilters.author.toLowerCase().split(" ")[0];
        const similar = uniqueAuthors.filter(
          (a) => a && String(a).toLowerCase().includes(searchTerm)
        );
        console.log("7. Similar author names:", similar);
      }
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

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
      (a, b) =>
        new Date((a as any).date).getTime() -
        new Date((b as any).date).getTime()
    );
  }, [filteredData]);

  // Filter handlers with debouncing for better performance
  const handleGlobalFilterChange = (filterType, filterValue) => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 FILTER CHANGE HANDLER");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1. Filter Type:", filterType);
    console.log("2. Filter Value:", filterValue);
    console.log("3. Filter Value Type:", typeof filterValue);
    console.log("4. Current Filters:", globalFilters);
    console.log(
      "5. Is toggle (same value)?:",
      filterValue === globalFilters[filterType]
    );

    const newValue =
      filterValue === globalFilters[filterType] ? null : filterValue;
    console.log("6. New Value (after toggle check):", newValue);

    setGlobalFilters((prev) => {
      const updated = {
        ...prev,
        [filterType]: newValue,
      };
      console.log("7. Updated Filters:", updated);
      return updated;
    });
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
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
  // If no client-side filters are active, use accurate database metrics from API
  // Otherwise, calculate from filtered data (which is limited to returned records)
  // Note: unit filter AND author filter are excluded as they're handled by the API
  const hasActiveFilters = Object.entries(globalFilters)
    .filter(([key]) => key !== "unit" && key !== "author") // Exclude unit and author filters (API handles these)
    .some(([, value]) => Boolean(value));

  const totalMentions = hasActiveFilters
    ? filteredData.length
    : metricsData?.totalMentions || filteredData.length;

  const totalEngagements = hasActiveFilters
    ? filteredData.reduce((sum, item) => sum + item.interactions, 0)
    : metricsData?.totalInteractions ||
      filteredData.reduce((sum, item) => sum + item.interactions, 0);

  const totalReach = hasActiveFilters
    ? filteredData.reduce((sum, item) => sum + item.reach, 0)
    : metricsData?.totalReach ||
      filteredData.reduce((sum, item) => sum + item.reach, 0);

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
      <div className="p-6 max-w-7xl mx-auto bg-white min-h-screen">
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
      <div className="p-6 max-w-7xl mx-auto bg-white min-h-screen">
        <Header />
        <Card className="text-center p-8">
          <CardHeader className="">
            <CardTitle className="text-red-600">
              Error Loading Dashboard
            </CardTitle>
            <CardDescription className="">{dataError.message}</CardDescription>
          </CardHeader>
          <CardContent className="">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className=""
              size="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-white min-h-screen pt-20">
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
              (Number(selectedDateRange.to) - Number(selectedDateRange.from)) /
                (1000 * 60 * 60 * 24)
            )}{" "}
            days)
            {hasActiveFilters &&
              transformedData.length > filteredData.length && (
                <span className="text-orange-600 ml-1">
                  (filtered from {formatNumber(transformedData.length)} total)
                </span>
              )}
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
            <SelectContent className="">
              <SelectItem className="" value="all">
                All Platforms
              </SelectItem>
              <SelectItem className="" value="Facebook">
                Facebook
              </SelectItem>
              <SelectItem className="" value="Instagram">
                Instagram
              </SelectItem>
              <SelectItem className="" value="Twitter">
                Twitter
              </SelectItem>
              <SelectItem className="" value="TikTok">
                TikTok
              </SelectItem>
              <SelectItem className="" value="YouTube">
                YouTube
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className=""
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button onClick={exportData} variant="outline" size="sm" className="">
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
            <Card className="">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Mentions
                </CardTitle>
                <MessageSquare className="h-5 w-5" />
              </CardHeader>
              <CardContent className="">
                <div className="text-3xl font-bold">
                  {formatNumber(totalMentions)}
                </div>
                <p className="text-xs mt-1">Across all platforms</p>
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Engagements
                </CardTitle>
                <ThumbsUp className="h-5 w-5" />
              </CardHeader>
              <CardContent className="">
                <div className="text-3xl font-bold">
                  {formatNumber(totalEngagements)}
                </div>
                <p className="text-xs mt-1">Likes, shares, comments</p>
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Reach
                </CardTitle>
                <Eye className="h-5 w-5" />
              </CardHeader>
              <CardContent className="">
                <div className="text-3xl font-bold">
                  {formatNumber(totalReach)}
                </div>
                <p className="text-xs mt-1">People reached</p>
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Channels by Unit
                </CardTitle>
                <Radio className="h-5 w-5" />
              </CardHeader>
              <CardContent className="">
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
            unitsData={unitsData}
            channelsData={channelsData}
            hasActiveFilters={hasActiveFilters}
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
            <Card className="">
              <PlatformDonutChart
                data={filteredData}
                platformsData={platformsData}
                platformByUnitData={platformByUnitData}
                channelsData={channelsData}
                hasActiveFilters={hasActiveFilters}
                onFilterChange={handleGlobalFilterChange}
                activeFilters={globalFilters}
              />
            </Card>
            <Card className="">
              <RTMUnitsPieChart
                data={filteredData}
                unitsData={unitsData}
                channelsData={channelsData}
                hasActiveFilters={hasActiveFilters}
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
            <Card className="">
              <PlatformMentionsChart
                data={filteredData}
                authorsData={authorsData}
                channelsData={channelsData}
                hasActiveFilters={hasActiveFilters}
                activeFilters={globalFilters}
                onFilterChange={handleGlobalFilterChange}
              />
            </Card>
            <Card className="">
              <EngagementRateChart
                data={filteredData}
                platformsData={platformsData}
                platformByUnitData={platformByUnitData}
                hasActiveFilters={hasActiveFilters}
                activeFilters={globalFilters}
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
          <Card className="">
            <OverallMentionsChart mentionsOverTime={mentionsOverTime} />
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {isLoading ? (
          <SkeletonCard className="h-96" />
        ) : (
          <Card className="">
            <EngagementOverTimeChart data={filteredData} />
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {isLoading ? (
          <SkeletonCard className="h-96" />
        ) : (
          <Card className="">
            <ClassificationMentionsChart data={filteredData} />
          </Card>
        )}
      </div>

      {/* Popular Mentions Table */}
      <div className="grid gap-6 lg:grid-cols-1">
        {isLoading ? (
          <SkeletonCard className="h-96" />
        ) : (
          <Card className="">
            <PopularMentionsTable data={filteredData} />
          </Card>
        )}
      </div>
    </div>
  );
};

export default RTMDashboard;
