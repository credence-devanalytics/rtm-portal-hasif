/**
 * Enhanced Social Media Mentions Dashboard
 * Integrates all dashboard components with filtering and state management
 */

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MetricsCards } from "@/components/dashboard/public-mentions/metrics-cards";
import { SentimentBySourceChart } from "@/components/dashboard/public-mentions/sentiment-by-source-chart";
import { SentimentAreaChart } from "@/components/dashboard/public-mentions/sentiment-area-chart";
import { MostPopularPosts } from "@/components/dashboard/public-mentions/most-popular-posts";
import { SentimentByTopicsChart } from "@/components/dashboard/charts/sentiment-by-topics-chart";
import EngagementRateChart from "@/components/dashboard/public-mentions/engagement-rate-chart";
import TopAuthorsTable from "@/components/dashboard/public-mentions/top-authors-table";
import Header from "@/components/Header";
import CalendarDatePicker from "@/components/CalendarDatePicker";
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
  Filter,
  X,
  Minimize2,
  Maximize2,
} from "lucide-react";

// Active Filters Display Component (Floating & Draggable)
const ActiveFilters = ({ filters, onRemoveFilter, onClearAll }) => {
  const [position, setPosition] = useState({ x: 32, y: 32 }); // Initial position (bottom-left with 8*4px = 32px offset)
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [cardRef, setCardRef] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    if (key === "dateRange") return false; // Exclude date range from active filters display
    if (key === "sentiments") return value && value.length > 0;
    if (key === "sources") return value && value.length > 0;
    if (key === "topics") return value && value.length > 0;
    if (key === "authors") return value && value.length > 0;
    return value !== null && value !== undefined && value !== "";
  });

  const handleMouseMove = useCallback(
    (e) => {
      if (!cardRef) return;

      // Calculate position from bottom-left
      const newX = e.clientX - dragOffset.x;
      const newY =
        window.innerHeight - e.clientY - (cardRef.offsetHeight - dragOffset.y);

      // Constrain to viewport
      const maxX = window.innerWidth - cardRef.offsetWidth;
      const maxY = window.innerHeight - cardRef.offsetHeight;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    },
    [dragOffset.x, dragOffset.y, cardRef]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = useCallback((e) => {
    // Only allow dragging from the header area
    if (e.target.closest(".drag-handle")) {
      setIsDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (activeFilters.length === 0) return null;

  const formatFilterValue = (key, value) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return String(value);
  };

  return (
    <Card
      ref={setCardRef}
      className="fixed z-50 shadow-2xl border-2 border-slate-200 max-w-lg bg-white transition-shadow hover:shadow-3xl"
      style={{
        left: `${position.x}px`,
        bottom: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "default",
      }}
      onMouseDown={handleMouseDown}
    >
      <CardHeader className="pb-4 px-6 pt-5 drag-handle cursor-grab active:cursor-grabbing">
        <CardTitle className="text-base font-semibold flex items-center justify-between gap-2.5 select-none">
          <div className="flex items-center gap-2.5">
            <Filter className="h-5 w-5 text-blue-600" />
            Active Filters
            {isMinimized && (
              <Badge variant="secondary" className="ml-2">
                {activeFilters.length}
              </Badge>
            )}
            {!isMinimized && (
              <span className="text-xs text-gray-400 font-normal ml-2">
                (drag to move)
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      {!isMinimized && (
        <CardContent className="pt-0 px-6 pb-5 space-y-4">
          <div className="flex flex-wrap gap-3">
            {activeFilters.map(([key, value]) => (
              <Badge
                key={key}
                variant="outline"
                className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 px-3 py-1.5 text-sm"
              >
                <span className="font-semibold capitalize">{key}:</span>
                <span className="font-normal">
                  {formatFilterValue(key, value)}
                </span>
                <X
                  className="h-4 w-4 cursor-pointer hover:text-red-600 transition-colors ml-1"
                  onClick={() => onRemoveFilter(key)}
                />
              </Badge>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="w-full text-xs hover:bg-red-50 hover:text-red-600 border-red-200 text-red-600"
          >
            <X className="h-3.5 w-3.5 mr-2" />
            Clear All Filters
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

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
  popularPosts: (filters, sortBy = "reach") => [
    "social-media",
    "popular-posts",
    filters,
    sortBy,
  ],
  topAuthors: (filters, sortBy, sortOrder) => [
    "social-media",
    "top-authors",
    filters,
    sortBy,
    sortOrder,
  ],
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

const fetchPopularPosts = async (filters, sortBy = "reach") => {
  const params = filterUtils.toUrlParams(filters);
  const sortParam = `&sort=${sortBy}`;
  const response = await fetch(
    `/api/social-media/popular-posts?${params}${sortParam}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch popular posts: ${response.statusText}`);
  }
  return response.json();
};

const fetchTopAuthors = async (
  filters,
  sortBy = "totalPosts",
  sortOrder = "desc"
) => {
  const params = filterUtils.toUrlParams(filters);
  const sortParams = `&sortBy=${sortBy}&sortOrder=${sortOrder}`;
  const response = await fetch(
    `/api/social-media/top-authors?${params}${sortParams}`
  );
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
  // Initialize date range (last 30 days)
  const [selectedDateRange, setSelectedDateRange] = useState(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return {
      from: thirtyDaysAgo,
      to: today,
    };
  });

  // Initialize filters with default date range
  const [filters, setFilters] = useState(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    return {
      ...DEFAULT_FILTERS,
      dateRange: {
        from: thirtyDaysAgo.toISOString().split("T")[0],
        to: today.toISOString().split("T")[0],
      },
    };
  });

  const [selectedSource, setSelectedSource] = useState("all");
  const [authorSortConfig, setAuthorSortConfig] = useState({
    sortBy: "totalPosts",
    sortOrder: "desc",
  });
  const [postsSortBy, setPostsSortBy] = useState("reach");
  const [isExporting, setIsExporting] = useState(false);
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
    queryKey: QUERY_KEYS.popularPosts(filters, postsSortBy),
    queryFn: () => fetchPopularPosts(filters, postsSortBy),
    staleTime: 30 * 1000,
    retry: 2,
  });

  const { data: topAuthorsData, isLoading: isLoadingTopAuthors } = useQuery({
    queryKey: QUERY_KEYS.topAuthors(
      filters,
      authorSortConfig.sortBy,
      authorSortConfig.sortOrder
    ),
    queryFn: () =>
      fetchTopAuthors(
        filters,
        authorSortConfig.sortBy,
        authorSortConfig.sortOrder
      ),
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

  // Handle date range change
  const handleDateRangeChange = (newDateRange) => {
    setSelectedDateRange(newDateRange);
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        from: newDateRange.from?.toISOString().split("T")[0],
        to: newDateRange.to?.toISOString().split("T")[0],
      },
    }));
  };

  // Handle source change
  const handleSourceChange = (source) => {
    setSelectedSource(source);
    setFilters((prev) => ({
      ...prev,
      sources: source === "all" ? [] : [source],
    }));
  };

  // Remove individual filter
  const handleRemoveFilter = (filterKey) => {
    if (
      filterKey === "sentiments" ||
      filterKey === "sources" ||
      filterKey === "topics" ||
      filterKey === "authors"
    ) {
      setFilters((prev) => ({
        ...prev,
        [filterKey]: [],
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [filterKey]: null,
      }));
    }

    // Reset source select if removing sources filter
    if (filterKey === "sources") {
      setSelectedSource("all");
    }
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Reset filters but keep the default 30-day date range
    setFilters({
      ...DEFAULT_FILTERS,
      dateRange: {
        from: thirtyDaysAgo.toISOString().split("T")[0],
        to: today.toISOString().split("T")[0],
      },
    });

    setSelectedSource("all");
    setSelectedDateRange({
      from: thirtyDaysAgo,
      to: today,
    });
  };

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
        } else if (type === "author") {
          const currentAuthors = newFilters.authors || [];
          if (currentAuthors.includes(value)) {
            newFilters.authors = currentAuthors.filter((a) => a !== value);
          } else {
            newFilters.authors = [...currentAuthors, value];
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
        } else if (clickData.type === "author") {
          // Handle author clicks with optional sentiment
          const currentAuthors = newFilters.authors || [];
          if (currentAuthors.includes(clickData.author)) {
            newFilters.authors = currentAuthors.filter(
              (a) => a !== clickData.author
            );
          } else {
            newFilters.authors = [...currentAuthors, clickData.author];
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

  // Handle author sort change
  const handleAuthorSortChange = useCallback((sortBy, sortOrder) => {
    setAuthorSortConfig({ sortBy, sortOrder });
  }, []);

  // Refresh all data
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["social-media"] });
  }, [queryClient]);

  // Handle popular posts sort change
  const handlePostsSortChange = useCallback((newSort) => {
    console.log("🔄 Changing posts sort to:", newSort);
    setPostsSortBy(newSort);
  }, []);

  // Export functionality
  const exportData = async () => {
    try {
      // Show export overlay
      setIsExporting(true);

      // Wait a brief moment for the overlay to render
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the dashboard container
      const dashboardElement = document.querySelector(
        ".dashboard-container"
      );

      if (!dashboardElement) {
        alert("Dashboard container not found. Please refresh and try again.");
        return;
      }

      // Hide the active filters card and export button temporarily
      // Using specific selector to target Active Filters inside dashboard-container
      const activeFiltersCard = document.querySelector(
        ".dashboard-container .fixed.z-50"
      );
      const exportButton = document.querySelector(
        'button[title*="Opens print dialog"]'
      );

      if (activeFiltersCard) activeFiltersCard.style.display = "none";
      if (exportButton) exportButton.style.display = "none";

      // Temporarily remove max-width constraints to capture full content
      const originalMaxWidth = dashboardElement.style.maxWidth;
      const originalWidth = dashboardElement.style.width;
      const originalMargin = dashboardElement.style.margin;
      dashboardElement.style.maxWidth = "none";
      dashboardElement.style.width = "fit-content";
      dashboardElement.style.margin = "0";

      // Scroll to top
      window.scrollTo(0, 0);

      // Wait for layout to stabilize after width change
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get the full scrollable width and height (including overflow)
      const fullWidth = Math.max(
        dashboardElement.scrollWidth,
        dashboardElement.offsetWidth,
        dashboardElement.clientWidth
      );
      const fullHeight = Math.max(
        dashboardElement.scrollHeight,
        dashboardElement.offsetHeight,
        dashboardElement.clientHeight
      );

      console.log("📐 Capturing dimensions:", {
        scrollWidth: dashboardElement.scrollWidth,
        offsetWidth: dashboardElement.offsetWidth,
        clientWidth: dashboardElement.clientWidth,
        fullWidth,
        fullHeight,
      });

      // Capture with html-to-image with ULTRA HIGH QUALITY settings
      const dataUrl = await htmlToImage.toPng(dashboardElement, {
        quality: 1.0, // Maximum quality
        pixelRatio: 2, // 2x resolution (optimal for capturing wide content)
        cacheBust: true, // Prevent caching issues
        backgroundColor: "#ffffff",
        width: fullWidth, // Use full width including scrollable area
        height: fullHeight, // Use full height including scrollable area
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });

      // Restore original styles
      dashboardElement.style.maxWidth = originalMaxWidth;
      dashboardElement.style.width = originalWidth;
      dashboardElement.style.margin = originalMargin;

      // Show hidden elements again
      if (activeFiltersCard) activeFiltersCard.style.display = "";
      if (exportButton) exportButton.style.display = "";

      // Create an image to get dimensions
      const img = new Image();
      img.src = dataUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Create PDF - scale down to fit A4
      const scaleFactor = 0.34;
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm

      // Calculate dimensions with scale factor (300 DPI for print quality)
      let scaledWidth = img.width * scaleFactor * 0.084667; // Convert pixels to mm (300 DPI)
      let scaledHeight = img.height * scaleFactor * 0.084667;

      // Determine orientation based on scaled dimensions
      const orientation = scaledHeight > scaledWidth ? "portrait" : "landscape";
      const pageWidth = orientation === "portrait" ? pdfWidth : pdfHeight;
      const pageHeight = orientation === "portrait" ? pdfHeight : pdfWidth;

      const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: "a4",
      });

      // Add margin for safety (5mm on each side)
      const margin = 5;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      // If image exceeds page bounds, scale it down proportionally to fit
      if (scaledWidth > availableWidth || scaledHeight > availableHeight) {
        const widthRatio = availableWidth / scaledWidth;
        const heightRatio = availableHeight / scaledHeight;
        const scaleRatio = Math.min(widthRatio, heightRatio);

        scaledWidth = scaledWidth * scaleRatio;
        scaledHeight = scaledHeight * scaleRatio;
      }

      // Center the image on the page
      const xOffset = (pageWidth - scaledWidth) / 2;
      const yOffset = (pageHeight - scaledHeight) / 2;

      // Add image centered on the page
      pdf.addImage(dataUrl, "PNG", xOffset, yOffset, scaledWidth, scaledHeight);

      // Save PDF with dynamic filename
      const fileName = `Social_Media_Dashboard_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      pdf.save(fileName);

      console.log("✅ PDF exported successfully!");
    } catch (error) {
      console.error("❌ Error exporting PDF:", error);
      alert(
        `Failed to export PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      // Hide export overlay
      setIsExporting(false);
    }
  };

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
      <div className="container mx-auto p-6 bg-white min-h-screen">
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
    <>
      {/* Export Overlay - MUST be outside dashboard-container */}
      {isExporting && (
        <div className="export-overlay fixed inset-0 z-[100] flex items-center justify-center" style={{ minHeight: '100vh', height: '100%' }}>
          {/* Blurred backdrop - scrollable, extended to cover full document height */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md" style={{ minHeight: '100vh', height: '100%', width: '100vw' }}></div>
          
          {/* Loading message */}
          <div className="relative z-10 bg-white rounded-lg shadow-2xl border-2 border-blue-500 p-8 max-w-md mx-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Download className="h-16 w-16 text-blue-600 animate-bounce" />
                <div className="absolute inset-0 h-16 w-16 text-blue-400 animate-ping opacity-75">
                  <Download className="h-16 w-16" />
                </div>  
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Exporting in Progress
                </h3>
                <p className="text-sm text-gray-600">
                  Please wait while we generate your PDF...
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse w-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 max-w-7xl mx-auto space-y-6 bg-white min-h-screen pt-20 dashboard-container">
        <Header />

        {/* Floating Active Filters */}
        <ActiveFilters
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* Subtle loading indicator at the top */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-blue-600 animate-pulse"></div>
      )}

      {/* Dashboard Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Social Media Mentions Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time analytics for social media mentions with interactive
            filtering
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getDateRangeDisplay()}
            {activeFilterCount > 0 && (
              <span className="text-blue-600 ml-2">
                ({activeFilterCount} filter
                {activeFilterCount !== 1 ? "s" : ""} active)
              </span>
            )}
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap items-center">
            <CalendarDatePicker
              selectedDateRange={selectedDateRange}
              onDateRangeChange={handleDateRangeChange}
            />

            <Select value={selectedSource} onValueChange={handleSourceChange}>
              <SelectTrigger className="w-36">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {SOURCE_OPTIONS.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className={isLoading ? "animate-pulse" : ""}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              onClick={exportData}
              variant="outline"
              size="sm"
              title="Opens print dialog. Set Scale to 19 in More Settings for best results."
            >
              <Download className="h-4 w-4 mr-2" />
              Print/Export PDF
            </Button>
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
        sortConfig={authorSortConfig}
        onSortChange={handleAuthorSortChange}
        onAuthorClick={handleChartClick}
      />

      {/* Popular Posts */}
      <MostPopularPosts
        data={popularPostsData?.data}
        onPostClick={handlePostClick}
        activeFilters={filters}
        isLoading={isLoadingPopular}
        onSortChange={handlePostsSortChange}
        currentSort={postsSortBy}
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
    </>
  );
};

export default SocialMediaDashboard;
