"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUpIcon,
  UsersIcon,
  PlayCircleIcon,
  BarChart3Icon,
  TvIcon,
  ActivityIcon,
  EyeIcon,
  ClockIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FilterIcon,
  RefreshCwIcon,
  Download,
} from "lucide-react";
import Header from "@/components/Header";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";

// Import recharts components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const MyTVViewershipPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    region: "all",
    channel: "all",
    sortBy: "viewers",
    sortOrder: "desc",
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Match the API default limit

  // Ref for scrolling to table
  const tableRef = React.useRef<HTMLDivElement>(null);

  // Available options for filters
  const availableChannels = [
    "TV1",
    "TV2",
    "OKEY",
    "BERITA RTM",
    "SUKAN RTM",
    "TV6",
    "BERNAMA",
  ];
  const availableRegions = ["Semenanjung Malaysia", "Kota Kinabalu & Kuching"];

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") params.append(key, value);
      });

      // Add pagination parameters
      params.append("page", currentPage.toString());
      params.append("limit", itemsPerPage.toString());

      const response = await fetch(`/api/mytv-viewership?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, itemsPerPage]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Scroll to table when page changes (after data loads)
  useEffect(() => {
    if (!loading && currentPage > 1 && tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading, currentPage]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const applyFilters = () => {
    fetchData();
  };

  const resetFilters = () => {
    setFilters({
      region: "all",
      channel: "all",
      sortBy: "viewers",
      sortOrder: "desc",
    });
    setCurrentPage(1); // Reset to first page
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (data?.pagination?.hasNext) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (data?.pagination?.hasPrev) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Format number utility
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  // Export data function - PDF Export with high quality
  const exportData = async () => {
    try {
      // Show export overlay
      setIsExporting(true);

      // Wait a brief moment for the overlay to render
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the dashboard container
      const dashboardElement = document.querySelector(
        ".dashboard-container"
      ) as HTMLElement;

      if (!dashboardElement) {
        alert("Dashboard container not found. Please refresh and try again.");
        setIsExporting(false);
        return;
      }

      // Hide the active filters card and export button temporarily
      const activeFiltersCard = document.querySelector(
        ".fixed.z-50"
      ) as HTMLElement | null;
      const exportButton = document.querySelector(
        'button[title*="Opens print dialog"]'
      ) as HTMLElement | null;

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

      // Create PDF - scale down to 50% of original size
      const scaleFactor = 0.57;
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
      const fileName = `MyTV_Viewership_Export_${
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

  // Chart colors
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FFC658",
  ];

  // Brand colors for channels
  const CHANNEL_COLORS = {
    TV1: "#122F86",
    TV2: "#FF5A08",
    OKEY: "#FDD302",
    "BERITA RTM": "#FD0001",
    "SUKAN RTM": "#9FA1A3",
    TV6: "#EA1F7D",
    BERNAMA: "#1F2023",
  };

  // Calculate filtered channel stats - use channelBreakdown from API which has program counts
  const filteredChannelStats = React.useMemo(() => {
    if (!data?.channelBreakdown) return {};

    const stats = {};

    // Use the channelBreakdown from API response as it already includes program counts from mytv_top_programs
    data.channelBreakdown.forEach((channelData) => {
      stats[channelData.channel] = {
        totalViewers: channelData.totalViewers || 0,
        programCount: channelData.programCount || 0,
      };
    });

    return stats;
  }, [data]);

  // Prepare MAU by Channels and Months data for bar chart
  const mauChartData = React.useMemo(() => {
    if (!data?.data) return [];

    // Define month order
    const monthOrder = [
      "Januari",
      "Februari",
      "Mac",
      "April",
      "Mei",
      "Jun",
      "Julai",
      "Ogos",
      "September",
      "Oktober",
      "November",
      "Disember",
    ];

    // Group data by month and channel
    const groupedData = {};

    data.data.forEach((item) => {
      const monthKey = item.month;
      if (!groupedData[monthKey]) {
        groupedData[monthKey] = { month: monthKey };
      }

      // Sum viewers for each channel in this month (MAU equivalent)
      if (!groupedData[monthKey][item.channel]) {
        groupedData[monthKey][item.channel] = 0;
      }
      groupedData[monthKey][item.channel] += item.viewers;
    });

    // Convert to array and sort by month order
    return Object.values(groupedData).sort((a, b) => {
      const aIndex = monthOrder.indexOf((a as any).month);
      const bIndex = monthOrder.indexOf((b as any).month);
      return aIndex - bIndex;
    });
  }, [data]);

  if (loading) {
    return (
      <div className="p-6 pt-16 max-w-7xl mx-auto">
        <Header />
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <RefreshCwIcon className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">
              Loading MyTV viewership data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Export Overlay - Outside dashboard container */}
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

      <div className="p-6 pt-16 max-w-7xl mx-auto space-y-6 bg-white min-h-screen dashboard-container">
        {/* Page Header with Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            MyTV Viewership Analytics
          </h1>
          <p className="text-muted-foreground">
            Channel viewership and MAU analytics for MyTV platform
          </p>
          {data && (
            <p className="text-xs text-gray-500 mt-1">
              Showing {formatNumber(data.summary.totalViewers)} total viewers
              across {data.summary.totalChannels} channels
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap items-center">
          {/* Channel Filter */}
          <div className="flex items-center space-x-2">
            <TvIcon className="h-4 w-4 text-gray-600" />
            <Select
              value={filters.channel}
              onValueChange={(value) => handleFilterChange("channel", value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent className="">
                <SelectItem className="" value="all">
                  All Channels
                </SelectItem>
                {availableChannels.map((channel) => (
                  <SelectItem className="" key={channel} value={channel}>
                    {channel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Region Filter */}
          <div className="flex items-center space-x-2">
            <FilterIcon className="h-4 w-4 text-gray-600" />
            <Select
              value={filters.region}
              onValueChange={(value) => handleFilterChange("region", value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent className="">
                <SelectItem className="" value="all">
                  All Regions
                </SelectItem>
                {availableRegions.map((region) => (
                  <SelectItem className="" key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={applyFilters}
            variant="outline"
            size="sm"
            className=""
            disabled={loading}
          >
            <RefreshCwIcon
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button 
            onClick={exportData} 
            variant="outline" 
            size="sm" 
            className=""
            title="Opens print dialog. Set Scale to 21 in More Settings for best results."
          >
            <Download className="h-4 w-4 mr-2" />
            Print/Export PDF
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700 text-sm">
              ⚠️ Data loading issue: {error}
            </p>
          </CardContent>
        </Card>
      )}
      {/* Channel Summary Cards - 6 Channels */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Channel Performance Overview
          </h2>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-300 px-3 py-1"
          >
            📊 2024 Data
          </Badge>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {data && (
            <>
              {/* TV1 Card */}
              <Card className="bg-white shadow-sm border-black col-span-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Logo on the left */}
                    <div className="shrink-0 pl-6 pr-4 py-1">
                      <img
                        src="/channel-logos/new-size-tv1.png"
                        alt="TV1 Logo"
                        className="h-32 w-32 object-contain"
                      />
                    </div>

                    {/* Stats on the right */}
                    <div className="flex-1 flex flex-col gap-2">
                      {/* Total Viewers (MAU) */}
                      <div className="space-y-1 text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {formatNumber(
                            filteredChannelStats["TV1"]?.totalViewers || 0
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          Total Viewers (MAU)
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-300"></div>

                      {/* Number of Programs */}
                      <div className="space-y-1 text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {filteredChannelStats["TV1"]?.programCount || 0}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          Number of Programs
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* TV2 Card */}
              <Card className="bg-white shadow-sm border-black col-span-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Logo on the left */}
                    <div className="shrink-0 pl-6 pr-4 py-1">
                      <img
                        src="/channel-logos/new-size-tv2.png"
                        alt="TV2 Logo"
                        className="h-32 w-32 object-contain"
                      />
                    </div>

                    {/* Stats on the right */}
                    <div className="flex-1 flex flex-col gap-2">
                      {/* Total Viewers (MAU) */}
                      <div className="space-y-1 text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {formatNumber(
                            filteredChannelStats["TV2"]?.totalViewers || 0
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          Total Viewers (MAU)
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-300"></div>

                      {/* Number of Programs */}
                      <div className="space-y-1 text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {filteredChannelStats["TV2"]?.programCount || 0}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          Number of Programs
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* TV6 Card */}
              <Card className="bg-white shadow-sm border-black col-span-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Logo on the left */}
                    <div className="shrink-0 pl-6 pr-4 py-1">
                      <img
                        src="/channel-logos/new-size-tv6.png"
                        alt="TV6 Logo"
                        className="h-32 w-32 object-contain"
                      />
                    </div>

                    {/* Stats on the right */}
                    <div className="flex-1 flex flex-col gap-2">
                      {/* Total Viewers (MAU) */}
                      <div className="space-y-1 text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {formatNumber(
                            filteredChannelStats["TV6"]?.totalViewers || 0
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          Total Viewers (MAU)
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-300"></div>

                      {/* Number of Programs */}
                      <div className="space-y-1 text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {filteredChannelStats["TV6"]?.programCount || 0}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          Number of Programs
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* OKEY Card */}
              <Card className="bg-white shadow-sm border-black col-span-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Logo on the left */}
                    <div className="shrink-0 pl-6 pr-4 py-1">
                      <img
                        src="/channel-logos/new-size-okey tv.png"
                        alt="OKEY Logo"
                        className="h-32 w-32 object-contain"
                      />
                    </div>

                    {/* Stats on the right */}
                    <div className="flex-1 flex flex-col gap-2">
                      {/* Total Viewers (MAU) */}
                      <div className="space-y-1 text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {formatNumber(
                            filteredChannelStats["OKEY"]?.totalViewers || 0
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          Total Viewers (MAU)
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-300"></div>

                      {/* Number of Programs */}
                      <div className="space-y-1 text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {filteredChannelStats["OKEY"]?.programCount || 0}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          Number of Programs
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SUKAN RTM Card */}
              <Card className="bg-white shadow-sm border-black col-span-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Logo on the left */}
                    <div className="shrink-0 pl-6 pr-4 py-1">
                      <img
                        src="/channel-logos/new-size-sukan rtm.png"
                        alt="SUKAN RTM Logo"
                        className="h-32 w-32 object-contain"
                      />
                    </div>

                    {/* Stats on the right */}
                    <div className="flex-1 flex flex-col gap-2">
                      {/* Total Viewers (MAU) */}
                      <div className="space-y-1 text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {formatNumber(
                            filteredChannelStats["SUKAN RTM"]?.totalViewers || 0
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          Total Viewers (MAU)
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-300"></div>

                      {/* Number of Programs */}
                      <div className="space-y-1 text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {filteredChannelStats["SUKAN RTM"]?.programCount || 0}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          Number of Programs
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* BERITA RTM Card */}
              <Card className="bg-white shadow-sm border-black col-span-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Logo on the left */}
                    <div className="shrink-0 pl-6 pr-4 py-1">
                      <img
                        src="/channel-logos/new-size-berita rtm.png"
                        alt="BERITA RTM Logo"
                        className="h-32 w-32 object-contain"
                      />
                    </div>

                    {/* Stats on the right */}
                    <div className="flex-1 flex flex-col gap-2">
                      {/* Total Viewers (MAU) */}
                      <div className="space-y-1 text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {formatNumber(
                            filteredChannelStats["BERITA RTM"]?.totalViewers || 0
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          Total Viewers (MAU)
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-300"></div>

                      {/* Number of Programs */}
                      <div className="space-y-1 text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {filteredChannelStats["BERITA RTM"]?.programCount || 0}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          Number of Programs
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Main Line Chart - MAU by Channels and Months */}
      <div className="grid gap-6 lg:grid-cols-1">
        {data && (
          <Card className="">
            <CardHeader className="">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUpIcon className="h-5 w-5 text-blue-600" />
                <span>MAU by Channels Across Months</span>
              </CardTitle>
              <CardDescription className="">
                Monthly Active Users trends by channel throughout the year
              </CardDescription>
            </CardHeader>
            <CardContent className="">
              {mauChartData && mauChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={500}>
                  <LineChart
                    data={mauChartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tickFormatter={(value) => {
                        if (value === 0) return "0";
                        if (value >= 1000000)
                          return `${(Number(value) / 1000000).toFixed(1)}M`;
                        if (value >= 1000)
                          return `${Math.round(Number(value) / 1000)}K`;
                        return value.toString();
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        value.toLocaleString(),
                        `${name} MAU`,
                      ]}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                    {availableChannels.map((channel, index) => (
                      <Line
                        key={channel}
                        type="linear"
                        dataKey={channel}
                        stroke={
                          CHANNEL_COLORS[channel] ||
                          COLORS[index % COLORS.length]
                        }
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name={channel}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
                  <div className="text-center text-gray-500">
                    <TrendingUpIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No MAU data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Additional Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {data && (
          <>
            {/* Channel Performance Breakdown */}
            <Card className="">
              <CardHeader className="">
                <CardTitle className="flex items-center space-x-2">
                  <TvIcon className="h-5 w-5 text-indigo-600" />
                  <span>Channel Performance</span>
                </CardTitle>
                <CardDescription className="">
                  Total viewership distribution by channel
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={data.channelBreakdown}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                    <XAxis
                      dataKey="channel"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tickFormatter={(value) => {
                        if (value === 0) return "0";
                        if (value >= 1000000)
                          return `${(Number(value) / 1000000).toFixed(1)}M`;
                        if (value >= 1000)
                          return `${Math.round(Number(value) / 1000)}K`;
                        return value.toString();
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => [
                        value.toLocaleString(),
                        "Total Viewers",
                      ]}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="totalViewers" radius={[8, 8, 0, 0]}>
                      {data.channelBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHANNEL_COLORS[entry.channel] || "#6366f1"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Regional Breakdown */}
            <Card className="">
              <CardHeader className="">
                <CardTitle className="flex items-center space-x-2">
                  <UsersIcon className="h-5 w-5 text-purple-600" />
                  <span>Regional Distribution</span>
                </CardTitle>
                <CardDescription className="">
                  Viewership by geographic regions
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-semibold">Region</th>
                        <th className="text-right p-3 font-semibold">
                          Total Viewers
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.regionalBreakdown || []).map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{item.region}</td>
                          <td className="p-3 text-right font-semibold">
                            {item.totalViewers.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Data Table */}
      <div className="grid gap-6 lg:grid-cols-1" ref={tableRef}>
        {data && (
          <Card className="">
            <CardHeader className="">
              <CardTitle className="flex items-center space-x-2">
                <PlayCircleIcon className="h-5 w-5 text-blue-600" />
                <span>Viewership Details</span>
              </CardTitle>
              <CardDescription className="">
                Detailed breakdown of viewership data
              </CardDescription>
            </CardHeader>
            <CardContent className="">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Channel</th>
                      <th className="text-left p-3">Region</th>
                      <th className="text-left p-3">Month</th>
                      <th className="text-right p-3">Viewers</th>
                      <th className="text-right p-3">Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data && data.data.length > 0 ? (
                      data.data.slice(0, 15).map((item, index) => (
                        <tr
                          key={`${item.id}-${index}`}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-3 font-medium">
                            {item.channel || "N/A"}
                          </td>
                          <td className="p-3">{item.region || "N/A"}</td>
                          <td className="p-3">{item.month || "N/A"}</td>
                          <td className="p-3 text-right">
                            {item.viewers ? item.viewers.toLocaleString() : "0"}
                          </td>
                          <td className="p-3 text-right">
                            {item.year || "N/A"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-3 text-center text-gray-500"
                        >
                          No viewership data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {data.pagination && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Showing page {data.pagination.page} of{" "}
                    {data.pagination.totalPages} ({data.pagination.total} total
                    records)
                  </span>
                  <div className="flex space-x-2">
                    {data.pagination.hasPrev && (
                      <Button
                        variant="outline"
                        size="sm"
                        className=""
                        onClick={handlePreviousPage}
                        disabled={loading}
                      >
                        Previous
                      </Button>
                    )}
                    {data.pagination.hasNext && (
                      <Button
                        variant="outline"
                        size="sm"
                        className=""
                        onClick={handleNextPage}
                        disabled={loading}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Insights */}
      <div className="grid gap-6 lg:grid-cols-1">
        {data && (
          <Card className="">
            <CardHeader className="">
              <CardTitle className="flex items-center space-x-2">
                <StarIcon className="h-5 w-5 text-amber-600" />
                <span>Key Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    🏆 Top Channel
                  </h4>
                  <p className="text-sm text-blue-700">
                    {data.channelBreakdown?.[0]?.channel} leads with{" "}
                    {formatNumber(
                      data.channelBreakdown?.[0]?.totalViewers || 0
                    )}{" "}
                    viewers
                  </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-900 mb-2">
                    📍 Top Region
                  </h4>
                  <p className="text-sm text-indigo-700">
                    {data.regionalBreakdown?.[0]?.region} dominates with{" "}
                    {formatNumber(
                      data.regionalBreakdown?.[0]?.totalViewers || 0
                    )}{" "}
                    viewers
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    📊 Platform Health
                  </h4>
                  <p className="text-sm text-purple-700">
                    {data.summary.totalChannels} channels across{" "}
                    {data.summary.totalRegions} regions active
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </>
  );
};

export default MyTVViewershipPage;
