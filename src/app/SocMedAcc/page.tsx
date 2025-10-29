"use client";
import React, { useState, useMemo, useEffect } from "react";
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

// Import custom hooks
import { useRTMMetrics } from "@/hooks/useRTMMetrics";
import { useRTMMediaTable } from "@/hooks/useRTMMediaTable";
import { useRTMPlatforms } from "@/hooks/useRTMPlatforms";
import { useRTMUnitsChannels } from "@/hooks/useRTMUnitsChannels";
import { useEngagementByPlatform } from "@/hooks/useEngagementByPlatform";

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
    channel: null,
  });

  // Build filter object for metrics API
  const metricsFilters = useMemo(() => {
    return {
      from: selectedDateRange.from.toISOString(),
      to: selectedDateRange.to.toISOString(),
      platform:
        globalFilters.platform ||
        (selectedPlatform !== "all" ? selectedPlatform : ""),
      channel: globalFilters.channel || "",
      unit: activeTab === "overall" ? "" : activeTab, // Add unit filter based on active tab
    };
  }, [
    selectedDateRange,
    selectedPlatform,
    globalFilters.platform,
    globalFilters.channel,
    activeTab,
  ]);

  // Fetch overview metrics using the new hook
  const {
    data: metricsData,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics,
  } = useRTMMetrics(metricsFilters);

  // Extract metrics values
  const totalMentions = metricsData?.totalMentions || 0;
  const totalEngagements = metricsData?.totalEngagements || 0;
  const totalReach = metricsData?.totalReach || 0;
  const channelsByUnitData = metricsData?.channelsByUnit || [];

  // Build filter object for media table (includes unit filter based on activeTab)
  const mediaTableFilters = useMemo(() => {
    return {
      from: selectedDateRange.from.toISOString(),
      to: selectedDateRange.to.toISOString(),
      platform:
        globalFilters.platform ||
        (selectedPlatform !== "all" ? selectedPlatform : ""),
      channel: globalFilters.channel || "",
      unit: activeTab === "overall" ? "" : activeTab, // Empty string for overall view
    };
  }, [
    selectedDateRange,
    selectedPlatform,
    globalFilters.platform,
    globalFilters.channel,
    activeTab,
  ]);

  // Fetch RTM Media Table data
  const {
    data: mediaTableData,
    isLoading: isLoadingMediaTable,
    error: mediaTableError,
    refetch: refetchMediaTable,
  } = useRTMMediaTable(mediaTableFilters);

  // Extract media table data - pass the whole object structure to components
  const unitsData = mediaTableData?.type === "units" ? mediaTableData : null;
  const channelsData =
    mediaTableData?.type === "channels" ? mediaTableData : null;

  console.log("🔍 Media Table State:", {
    isLoadingMediaTable,
    hasMediaTableData: !!mediaTableData,
    mediaTableType: mediaTableData?.type,
    hasUnitsData: !!unitsData,
    hasChannelsData: !!channelsData,
  });

  // Fetch RTM Platforms data
  const {
    data: platformsResponse,
    isLoading: isLoadingPlatforms,
    error: platformsError,
    refetch: refetchPlatforms,
  } = useRTMPlatforms(mediaTableFilters);

  // Extract platforms data
  const platformsData = platformsResponse?.data || null;

  // Fetch Engagement by Platform data (for EngagementRateChart)
  const {
    data: engagementResponse,
    isLoading: isLoadingEngagement,
    error: engagementError,
    refetch: refetchEngagement,
  } = useEngagementByPlatform({
    from: selectedDateRange.from.toISOString(),
    to: selectedDateRange.to.toISOString(),
    platform: globalFilters.platform || "",
    channel: globalFilters.channel || "",
  });

  // Extract engagement data
  const engagementPlatformsData = engagementResponse?.data || null;

  console.log("🔍 Platforms State:", {
    isLoadingPlatforms,
    hasPlatformsData: !!platformsData,
    platformsCount: platformsData?.length,
  });

  console.log("📊 Engagement by Platform State:", {
    isLoadingEngagement,
    hasEngagementData: !!engagementPlatformsData,
    engagementCount: engagementPlatformsData?.length,
    engagementError: engagementError?.message,
    sampleData: engagementPlatformsData?.slice(0, 2),
  });

  // Build filter object for Units & Channels API
  // Note: We include the unit filter from activeTab, NOT from globalFilters.unit
  // because the tab controls which unit view we're in
  const unitsChannelsFilters = useMemo(() => {
    return {
      from: selectedDateRange.from.toISOString(),
      to: selectedDateRange.to.toISOString(),
      platform:
        globalFilters.platform ||
        (selectedPlatform !== "all" ? selectedPlatform : ""),
      channel: globalFilters.channel || "",
      unit: activeTab === "overall" ? "" : activeTab, // Filter by active tab
    };
  }, [
    selectedDateRange.from,
    selectedDateRange.to,
    globalFilters.platform,
    globalFilters.channel,
    selectedPlatform,
    activeTab, // Add activeTab to dependencies
  ]);

  // Fetch RTM Units & Channels data for pie chart
  const {
    data: unitsChannelsData,
    isLoading: isLoadingUnitsChannels,
    error: unitsChannelsError,
    refetch: refetchUnitsChannels,
  } = useRTMUnitsChannels(unitsChannelsFilters);

  console.log("🔍 Units & Channels State:", {
    isLoadingUnitsChannels,
    hasUnitsChannelsData: !!unitsChannelsData,
    unitsCount: unitsChannelsData?.units?.data?.length,
    channelsCount: unitsChannelsData?.channels?.data?.length,
    filters: unitsChannelsFilters,
  });

  // ============================================
  // DASHBOARD DATA STATE & FILTERS
  // ============================================

  // Placeholder state for other dashboard data (charts, tables, etc.)
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  // Example filter object you might need for other data
  const queryFilters = useMemo(() => {
    const daysDiff = Math.ceil(
      (Number(selectedDateRange.to) - Number(selectedDateRange.from)) /
        (1000 * 60 * 60 * 24)
    );

    return {
      days: daysDiff.toString(),
      from: selectedDateRange.from.toISOString(),
      to: selectedDateRange.to.toISOString(),
      platform:
        globalFilters.platform ||
        (selectedPlatform !== "all" ? selectedPlatform : ""),
      channel: globalFilters.channel || "",
    };
  }, [
    selectedDateRange,
    selectedPlatform,
    globalFilters.platform,
    globalFilters.channel,
  ]);

  // Fetch dashboard data (mentions, authors, dailyChannelData, etc.)
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setDataError(null);

      try {
        const params = new URLSearchParams({
          from: queryFilters.from,
          to: queryFilters.to,
          platform: queryFilters.platform,
          channel: queryFilters.channel,
        });

        const response = await fetch(`/api/mentions?${params}`);
        if (!response.ok) throw new Error("Failed to fetch dashboard data");

        const data = await response.json();
        console.log("📥 Dashboard data fetched:", {
          hasMentions: !!data.mentions,
          mentionsCount: data.mentions?.length,
          hasAuthorsData: !!data.authorsData,
          authorsCount: data.authorsData?.length,
          hasDailyChannelData: !!data.dailyChannelData,
          dailyChannelCount: data.dailyChannelData?.length,
        });

        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setDataError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [
    queryFilters.from,
    queryFilters.to,
    queryFilters.platform,
    queryFilters.channel,
  ]);

  // ============================================
  // END DASHBOARD DATA SECTION
  // ============================================

  // Extract data from response (or set to null/empty)
  const rawMentionsData = dashboardData;
  const otherMetricsData = dashboardData?.metrics; // Renamed to avoid conflict
  const timelineData = dashboardData?.timeSeries;
  // platformsData is now fetched via useRTMPlatforms hook above
  const platformByUnitData = dashboardData?.platformByUnit;
  const oldUnitsData = dashboardData?.units; // Renamed to avoid conflict with media table data
  const oldChannelsData = dashboardData?.channels; // Renamed to avoid conflict with media table data
  const authorsData = dashboardData?.authorsData;
  const dailyChannelData = dashboardData?.dailyChannelData; // New: daily channel breakdown for time series

  // Debug logging
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 DASHBOARD DATA RECEIVED");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. Query Filters:", queryFilters);
  console.log("2. Global Filters:", globalFilters);
  console.log("3. Raw mentions count:", dashboardData?.mentions?.length);
  console.log("4. Overview Metrics:", {
    totalMentions,
    totalEngagements,
    totalReach,
    channelsByUnit: channelsByUnitData?.length,
  });
  console.log(
    "5. Platforms Data:",
    !!platformsData,
    "count:",
    platformsData?.length
  );
  console.log(
    "6. Has platformByUnitData:",
    !!platformByUnitData,
    platformByUnitData?.length
  );
  console.log(
    "7. Media Table - unitsData:",
    !!unitsData,
    unitsData?.data?.length
  );
  console.log(
    "8. Media Table - channelsData:",
    !!channelsData,
    channelsData?.data?.length
  );
  console.log("9. Has authorsData:", !!authorsData, authorsData?.length);
  console.log(
    "10. Has dailyChannelData:",
    !!dailyChannelData,
    dailyChannelData?.length
  );
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
  if (dailyChannelData && dailyChannelData.length > 0) {
    console.log(
      "10. Sample dailyChannelData:",
      dailyChannelData.slice(0, 5).map((d: any) => ({
        date: d.date,
        channel: d.channel,
        count: d.count,
      }))
    );
  }
  console.log(
    "10. Sample mentions (first 3):",
    dashboardData?.mentions?.slice(0, 3)
  );
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Transform and filter data efficiently
  const { transformedData, filteredData } = useMemo(() => {
    if (!rawMentionsData?.mentions)
      return { transformedData: [], filteredData: [] };

    // TODO: Add your data transformation logic here
    // Transform raw API data into the format your charts expect
    const transformed = rawMentionsData.mentions.map((row, index) => {
      // Your transformation logic goes here
      // Example structure:
      // return {
      //   id: row.id,
      //   author: row.channel,
      //   sentiment: row.sentiment,
      //   platform: determinePlatform(row.type),
      //   unit: determineUnit(row.groupname),
      //   date: formatDate(row.inserttime),
      //   interactions: calculateInteractions(row),
      //   reach: row.reach,
      //   ... etc
      // };
      return row; // PLACEHOLDER - implement your transformation
    });

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

      // Platform filter - case-insensitive comparison
      if (globalFilters.platform) {
        const itemPlatform = item.platform?.toLowerCase() || "";
        const filterPlatform = globalFilters.platform.toLowerCase();
        if (itemPlatform !== filterPlatform) {
          // Debug platform filtering
          if (transformed.indexOf(item) < 5) {
            // Only log first 5 to avoid spam
            console.log(
              `   ❌ Platform mismatch: "${item.platform}" (${itemPlatform}) !== "${globalFilters.platform}" (${filterPlatform})`
            );
          }
          return false;
        }
      }

      if (globalFilters.category && item.category !== globalFilters.category)
        return false;
      if (globalFilters.channel) {
        const filterChannel = globalFilters.channel.toLowerCase();
        const itemChannel = item.channel ? item.channel.toLowerCase() : "";
        const itemAuthor = item.author ? item.author.toLowerCase() : "";
        if (
          !itemChannel.includes(filterChannel) &&
          !itemAuthor.includes(filterChannel)
        ) {
          // Debug channel filtering
          if (transformed.indexOf(item) < 5) {
            // Only log first 5 to avoid spam
            console.log(
              `   ❌ Channel mismatch: neither "${item.channel}" nor "${item.author}" includes "${globalFilters.channel}"`
            );
          }
          return false;
        }
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
      console.log("5. Looking for:", globalFilters.channel);
      console.log(
        "6. Does data contain this author?",
        uniqueAuthors.includes(globalFilters.channel)
      );

      // Check for similar author names
      if (globalFilters.channel) {
        const searchTerm = globalFilters.channel.toLowerCase().split(" ")[0];
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
      // Skip items without required fields
      if (!item.date || !item.platform) return;

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
      channel: null,
    });
    setActiveTab("overall");
  };

  const handleDateRangeChange = (newDateRange) => {
    setSelectedDateRange(newDateRange);
  };

  // Refresh data
  const handleRefresh = () => {
    // Refresh metrics and media table
    refetchMetrics();
    refetchMediaTable();
    // TODO: Add refresh for other data when implemented
  };

  // Calculate metrics
  // Check if there are any client-side filters active (excluding unit and author which are handled by API)
  const hasActiveFilters = Object.entries(globalFilters)
    .filter(([key]) => key !== "unit" && key !== "author") // Exclude unit and author filters (API handles these)
    .some(([, value]) => Boolean(value));

  // Calculate metrics from filtered data when client-side filters are active
  // Otherwise use API metrics
  // Always use API metrics - they already respect filters
  // The API handles filtering, so we don't need to recalculate from filteredData
  const displayTotalMentions = totalMentions;
  const displayTotalEngagements = totalEngagements;
  const displayTotalReach = totalReach;

  // Sentiment metrics calculated from filtered data
  const positiveMentions = filteredData.filter(
    (d) => d.sentiment === "positive"
  ).length;
  const negativeMentions = filteredData.filter(
    (d) => d.sentiment === "negative"
  ).length;

  const positiveRatio =
    displayTotalMentions > 0 ? positiveMentions / displayTotalMentions : 0;
  const negativeRatio =
    displayTotalMentions > 0 ? negativeMentions / displayTotalMentions : 0;

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
      totalMentions: displayTotalMentions,
      totalEngagements: displayTotalEngagements,
      totalReach: displayTotalReach,
      data: filteredData,
      dateRange: selectedDateRange,
      filters: globalFilters,
      hasActiveFilters,
      rawTotals: hasActiveFilters
        ? {
            totalMentions,
            totalEngagements,
            totalReach,
          }
        : null,
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

  // Show error state only, no loading screen
  if (metricsError && !metricsData) {
    return (
      <div className="p-6 max-w-7xl mx-auto bg-white min-h-screen">
        <Header />
        <Card className="text-center p-8">
          <CardHeader className="">
            <CardTitle className="text-red-600">
              Error Loading Dashboard
            </CardTitle>
            <CardDescription className="">
              {metricsError.message}
            </CardDescription>
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

      {/* Subtle loading indicator at the top */}
      {isLoadingMetrics && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-blue-600 animate-pulse"></div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            RTM Social Media Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring across Radio, TV, and Berita social channels
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Showing {formatNumber(displayTotalMentions)} mentions from selected
            date range (
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
            className={`${
              isLoadingMetrics || isLoadingMediaTable ? "animate-pulse" : ""
            }`}
            disabled={isLoadingMetrics && isLoadingMediaTable}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                isLoadingMetrics || isLoadingMediaTable ? "animate-spin" : ""
              }`}
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
      <div
        className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 transition-opacity duration-300 ${
          isLoadingMetrics ? "opacity-60" : "opacity-100"
        }`}
      >
        {!metricsData && isLoadingMetrics ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Total Posts Card - Shows filtered count */}
            <Card
              className={`transition-all ${
                hasActiveFilters ? "border-blue-500 border-2" : ""
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Posts
                </CardTitle>
                <MessageSquare className="h-5 w-5" />
              </CardHeader>
              <CardContent className="">
                <div className="text-3xl font-bold">
                  {formatNumber(displayTotalMentions)}
                </div>
                <p className="text-xs mt-1">
                  {hasActiveFilters ? (
                    <span className="text-blue-600 font-medium">
                      Filtered results
                    </span>
                  ) : (
                    "Across all platforms"
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Total Engagements Card - Shows filtered count */}
            <Card
              className={`transition-all ${
                hasActiveFilters ? "border-blue-500 border-2" : ""
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Engagements
                </CardTitle>
                <ThumbsUp className="h-5 w-5" />
              </CardHeader>
              <CardContent className="">
                <div className="text-3xl font-bold">
                  {formatNumber(displayTotalEngagements)}
                </div>
                <p className="text-xs mt-1">
                  {hasActiveFilters ? (
                    <span className="text-blue-600 font-medium">
                      Filtered results
                    </span>
                  ) : (
                    "Likes, shares, comments"
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Total Reach Card - Shows filtered count */}
            <Card
              className={`transition-all ${
                hasActiveFilters ? "border-blue-500 border-2" : ""
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Reach
                </CardTitle>
                <Eye className="h-5 w-5" />
              </CardHeader>
              <CardContent className="">
                <div className="text-3xl font-bold">
                  {formatNumber(displayTotalReach)}
                </div>
                <p className="text-xs mt-1">
                  {hasActiveFilters ? (
                    <span className="text-blue-600 font-medium">
                      Filtered results
                    </span>
                  ) : (
                    "People reached"
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Total Channels by Unit Card - WITH CROSS-FILTERING */}
            <Card className="">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Channels by Unit
                </CardTitle>
                <Radio className="h-5 w-5" />
              </CardHeader>
              <CardContent className="">
                {(() => {
                  // Helper function to find count by unit name
                  const getChannelCount = (unitName: string) => {
                    const unitData = channelsByUnitData.find(
                      (c) =>
                        c.unit &&
                        c.unit.toLowerCase().includes(unitName.toLowerCase())
                    );
                    return unitData?.totalChannels || 0;
                  };

                  const isUnitActive = (unit: string) => {
                    return globalFilters.unit === unit || activeTab === unit;
                  };

                  return (
                    <div className="grid grid-cols-4 gap-3">
                      <button
                        onClick={() => {
                          setActiveTab("official");
                          handleGlobalFilterChange("unit", "official");
                        }}
                        className={`text-center p-2 rounded-md transition-all hover:bg-slate-100 ${
                          isUnitActive("official")
                            ? "bg-slate-900 text-white"
                            : ""
                        }`}
                      >
                        <span
                          className={`text-xs ${
                            isUnitActive("official")
                              ? "text-white"
                              : "text-gray-600"
                          }`}
                        >
                          Official
                        </span>
                        <div className="text-lg font-semibold">
                          {getChannelCount("official")}
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("tv");
                          handleGlobalFilterChange("unit", "tv");
                        }}
                        className={`text-center p-2 rounded-md transition-all hover:bg-slate-100 ${
                          isUnitActive("tv") ? "bg-slate-900 text-white" : ""
                        }`}
                      >
                        <span
                          className={`text-xs ${
                            isUnitActive("tv") ? "text-white" : "text-gray-600"
                          }`}
                        >
                          TV
                        </span>
                        <div className="text-lg font-semibold">
                          {getChannelCount("tv")}
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("berita");
                          handleGlobalFilterChange("unit", "berita");
                        }}
                        className={`text-center p-2 rounded-md transition-all hover:bg-slate-100 ${
                          isUnitActive("berita")
                            ? "bg-slate-900 text-white"
                            : ""
                        }`}
                      >
                        <span
                          className={`text-xs ${
                            isUnitActive("berita")
                              ? "text-white"
                              : "text-gray-600"
                          }`}
                        >
                          News
                        </span>
                        <div className="text-lg font-semibold">
                          {getChannelCount("berita") || getChannelCount("news")}
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("radio");
                          handleGlobalFilterChange("unit", "radio");
                        }}
                        className={`text-center p-2 rounded-md transition-all hover:bg-slate-100 ${
                          isUnitActive("radio") ? "bg-slate-900 text-white" : ""
                        }`}
                      >
                        <span
                          className={`text-xs ${
                            isUnitActive("radio")
                              ? "text-white"
                              : "text-gray-600"
                          }`}
                        >
                          Radio
                        </span>
                        <div className="text-lg font-semibold">
                          {getChannelCount("radio")}
                        </div>
                      </button>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* RTM Media Table */}
      <div
        className={`grid gap-6 lg:grid-cols-1 transition-opacity duration-300 ${
          isLoadingMediaTable ? "opacity-60" : "opacity-100"
        }`}
      >
        {!mediaTableData && isLoadingMediaTable ? (
          <SkeletonCard className="h-96" />
        ) : mediaTableError && !mediaTableData ? (
          <Card className="">
            <CardContent className="pt-6">
              <div className="text-center text-red-500">
                <p>Error loading media table: {mediaTableError.message}</p>
                <Button
                  onClick={() => refetchMediaTable()}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <RTMMediaTable
            data={
              [] /* No longer needed - component will use unitsData/channelsData */
            }
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
                onFilterChange={handleGlobalFilterChange}
                activeFilters={globalFilters}
              />
            </Card>
            <Card className="">
              <RTMUnitsPieChart
                data={filteredData}
                unitsData={unitsChannelsData?.units}
                channelsData={unitsChannelsData?.channels}
                onFilterChange={handleGlobalFilterChange}
                activeFilters={globalFilters}
                setActiveTab={setActiveTab}
                activeTab={activeTab}
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
                channelsData={oldChannelsData}
                dailyChannelData={dailyChannelData}
                activeFilters={globalFilters}
                onFilterChange={handleGlobalFilterChange}
              />
            </Card>
            <Card className="">
              <EngagementRateChart
                data={filteredData}
                platformsData={engagementPlatformsData}
                platformByUnitData={platformByUnitData}
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
