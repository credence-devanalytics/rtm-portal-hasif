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
  Star,
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  RefreshCw,
  Download,
  Filter,
  TvIcon,
} from "lucide-react";
import Header from "@/components/Header";
import NextImage from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";

const ASTROPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [channelSummary, setChannelSummary] = useState([]);
  const [reachOverTime, setReachOverTime] = useState([]);
  const [ratingOverTime, setRatingOverTime] = useState([]);
  const [tvReachOverTime, setTvReachOverTime] = useState([]);
  const [tvRatingOverTime, setTvRatingOverTime] = useState([]);
  const [radioReachOverTime, setRadioReachOverTime] = useState([]);
  const [radioRatingOverTime, setRadioRatingOverTime] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    year: "2025",
    channel: "all",
    metricType: "all",
  });

  // Channel logo mapping
  const channelLogos = {
    TV1: "/channel-logos/new-size-tv1.png",
    TV2: "/channel-logos/new-size-tv2.png",
    "TV OKEY": "/channel-logos/new-size-okey tv.png",
    "BERITA RTM": "/channel-logos/new-size-berita rtm.png",
    "SUKAN RTM": "/channel-logos/new-size-sukan rtm.png",
    TV6: "/channel-logos/new-size-tv6.png",
    AsyikFM: "/multiplatform-logos/new-size-asyikfm.png",
    TraxxFM: "/multiplatform-logos/new-size-traxxfm.png",
    MinnalFM: "/multiplatform-logos/new-size-minnalfm.png",
    AiFM: "/multiplatform-logos/new-size-aifm.png",
  };

  // Channel colors for line chart
  const channelColors = {
    TV1: "#122F86",
    TV2: "#FF5A08",
    "TV OKEY": "#FDD302",
    OKEY: "#FDD302",
    "BERITA RTM": "#FD0001",
    "SUKAN RTM": "#9FA1A3",
    TV6: "#EA1F7D",
    BERNAMA: "#1F2023",
    // Radio brands
    AsyikFM: "#6C2870",
    TraxxFM: "#E63265",
    MinnalFM: "#7E3683",
    AiFM: "#FF000D",
  };

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.year && filters.year !== "all")
        params.append("year", filters.year);
      if (filters.channel && filters.channel !== "all")
        params.append("channel", filters.channel);
      if (filters.metricType && filters.metricType !== "all")
        params.append("metricType", filters.metricType);

      const response = await fetch(`/api/astro-rate-reach?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("ASTRO API Response:", result);
      setData(result);
      setError(null);

      // Process channel summary data
      if (result.success && result.data) {
        processChannelSummary(result.data);
        processReachOverTime(result.data);
        processRatingOverTime(result.data);
        processTvReachOverTime(result.data);
        processTvRatingOverTime(result.data);
        processRadioReachOverTime(result.data);
        processRadioRatingOverTime(result.data);
      }
    } catch (err) {
      console.error("Error fetching ASTRO data:", err);
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Process channel summary for cards
  const processChannelSummary = (rawData) => {
    // No channels to exclude - show all channels including FM stations
    const excludedChannels = [];

    // Group by channel
    const channelMap = {};

    rawData.forEach((record) => {
      const channel = record.channel;

      // Skip excluded channels
      if (excludedChannels.includes(channel)) {
        return;
      }

      if (!channelMap[channel]) {
        channelMap[channel] = {
          channel: channel,
          rating: 0,
          reach: 0,
          ratingCount: 0,
          reachCount: 0,
        };
      }

      // Check for both camelCase and snake_case
      const metricType = record.metricType || record.metric_type;

      if (metricType === "rating") {
        channelMap[channel].rating += record.value || 0;
        channelMap[channel].ratingCount += 1;
      } else if (metricType === "reach") {
        channelMap[channel].reach += record.value || 0;
        channelMap[channel].reachCount += 1;
      }
    });

    // Convert to array and calculate averages
    const summaryArray = Object.values(channelMap).map((item) => {
      const avgRatingValue =
        item.ratingCount > 0 ? item.rating / item.ratingCount : 0;

      // Use 3 decimal places if rating is below 2.0, otherwise use 1 decimal place
      const avgRating =
        avgRatingValue < 2.0
          ? avgRatingValue.toFixed(3)
          : avgRatingValue.toFixed(1);

      return {
        channel: item.channel,
        avgRating: avgRating,
        totalReach: item.reach.toLocaleString(),
        totalReachRaw: item.reach,
        logo: channelLogos[item.channel] || null,
      };
    });

    // Sort by total reach (descending)
    summaryArray.sort((a, b) => b.totalReachRaw - a.totalReachRaw);

    console.log("Channel Summary:", summaryArray);
    setChannelSummary(summaryArray);
  };

  // Process reach over time data for line chart
  const processReachOverTime = (rawData) => {
    console.log("Raw data for line chart:", rawData);

    // Month names mapping
    const monthNames = {
      1: "January",
      2: "February",
      3: "March",
      4: "April",
      5: "May",
      6: "June",
      7: "July",
      8: "August",
      9: "September",
      10: "October",
      11: "November",
      12: "December",
    };

    // Filter only reach data - use selected year from filters or show all years
    // DO NOT exclude any channels - show all channels in the chart
    const reachData = rawData.filter((record) => {
      const metricType = record.metricType || record.metric_type;
      const txYear = record.txYear || record.tx_year;

      // If "all" is selected or no year filter, show all years
      if (filters.year === "all") {
        return metricType === "reach";
      }

      // Otherwise filter by selected year
      return (
        metricType === "reach" &&
        (txYear === parseInt(filters.year) || txYear === filters.year)
      );
    });

    console.log("Filtered reach data:", reachData);

    // Get all unique channels
    const allChannels = [...new Set(reachData.map((record) => record.channel))];
    console.log("All channels found:", allChannels);

    // Group by txMonth (or tx_month)
    const monthMap = {};

    reachData.forEach((record) => {
      const monthNum = record.txMonth || record.tx_month;
      const monthName = monthNames[monthNum] || `Month ${monthNum}`;
      const channel = record.channel;

      if (!monthMap[monthNum]) {
        monthMap[monthNum] = { month: monthName, monthNum: monthNum };
        // Initialize all channels with 0 for this month
        allChannels.forEach((ch) => {
          monthMap[monthNum][ch] = 0;
        });
      }

      // Store the value for this channel in this month
      monthMap[monthNum][channel] = record.value || 0;
    });

    // Convert to array and sort by monthNum
    const timeSeriesArray = Object.values(monthMap).sort((a, b) => {
      // Sort months numerically (1, 2, 3... 12)
      return parseInt(a.monthNum) - parseInt(b.monthNum);
    });

    console.log("Reach Over Time:", timeSeriesArray);
    console.log("Number of months:", timeSeriesArray.length);
    console.log("Channels in data:", allChannels);
    setReachOverTime(timeSeriesArray);
  };

  // Process rating over time data for line chart
  const processRatingOverTime = (rawData) => {
    console.log("Raw data for rating chart:", rawData);

    // Month names mapping
    const monthNames = {
      1: "January",
      2: "February",
      3: "March",
      4: "April",
      5: "May",
      6: "June",
      7: "July",
      8: "August",
      9: "September",
      10: "October",
      11: "November",
      12: "December",
    };

    // Filter only rating data - use selected year from filters or show all years
    const ratingData = rawData.filter((record) => {
      const metricType = record.metricType || record.metric_type;
      const txYear = record.txYear || record.tx_year;

      // If "all" is selected or no year filter, show all years
      if (filters.year === "all") {
        return metricType === "rating";
      }

      // Otherwise filter by selected year
      return (
        metricType === "rating" &&
        (txYear === parseInt(filters.year) || txYear === filters.year)
      );
    });

    console.log("Filtered rating data:", ratingData);

    // Get all unique channels
    const allChannels = [
      ...new Set(ratingData.map((record) => record.channel)),
    ];
    console.log("All channels with rating:", allChannels);

    // Group by txMonth (or tx_month)
    const monthMap = {};

    ratingData.forEach((record) => {
      const monthNum = record.txMonth || record.tx_month;
      const monthName = monthNames[monthNum] || `Month ${monthNum}`;
      const channel = record.channel;

      if (!monthMap[monthNum]) {
        monthMap[monthNum] = { month: monthName, monthNum: monthNum };
        // Initialize all channels with null for this month
        allChannels.forEach((ch) => {
          monthMap[monthNum][ch] = null;
        });
      }

      // Store the value for this channel in this month (only if > 0)
      const value = record.value || 0;
      monthMap[monthNum][channel] = value > 0 ? value : null;
    });

    // Convert to array and sort by monthNum
    const timeSeriesArray = Object.values(monthMap).sort((a, b) => {
      return parseInt(a.monthNum) - parseInt(b.monthNum);
    });

    // Filter out channels that have all null/zero values
    const channelsWithData = allChannels.filter((channel) => {
      return timeSeriesArray.some(
        (month) => month[channel] != null && month[channel] > 0
      );
    });

    console.log("Rating Over Time:", timeSeriesArray);
    console.log("Channels with non-zero rating:", channelsWithData);
    setRatingOverTime(timeSeriesArray);
  };

  // Process TV reach over time data for line chart
  const processTvReachOverTime = (rawData) => {
    const monthNames = {
      1: "January",
      2: "February",
      3: "March",
      4: "April",
      5: "May",
      6: "June",
      7: "July",
      8: "August",
      9: "September",
      10: "October",
      11: "November",
      12: "December",
    };

    // Filter only reach data for TV channels
    const reachData = rawData.filter((record) => {
      const metricType = record.metricType || record.metric_type;
      const txYear = record.txYear || record.tx_year;
      const channel = record.channel;
      const isTvChannel = channel.toLowerCase().includes('tv');

      if (filters.year === "all") {
        return metricType === "reach" && isTvChannel;
      }

      return (
        metricType === "reach" &&
        isTvChannel &&
        (txYear === parseInt(filters.year) || txYear === filters.year)
      );
    });

    const allChannels = [...new Set(reachData.map((record) => record.channel))];
    const monthMap = {};

    reachData.forEach((record) => {
      const monthNum = record.txMonth || record.tx_month;
      const monthName = monthNames[monthNum] || `Month ${monthNum}`;
      const channel = record.channel;

      if (!monthMap[monthNum]) {
        monthMap[monthNum] = { month: monthName, monthNum: monthNum };
        allChannels.forEach((ch) => {
          monthMap[monthNum][ch] = 0;
        });
      }

      monthMap[monthNum][channel] = record.value || 0;
    });

    const timeSeriesArray = Object.values(monthMap).sort((a, b) => {
      return parseInt(a.monthNum) - parseInt(b.monthNum);
    });

    setTvReachOverTime(timeSeriesArray);
  };

  // Process TV rating over time data for line chart
  const processTvRatingOverTime = (rawData) => {
    const monthNames = {
      1: "January",
      2: "February",
      3: "March",
      4: "April",
      5: "May",
      6: "June",
      7: "July",
      8: "August",
      9: "September",
      10: "October",
      11: "November",
      12: "December",
    };

    const ratingData = rawData.filter((record) => {
      const metricType = record.metricType || record.metric_type;
      const txYear = record.txYear || record.tx_year;
      const channel = record.channel;
      const isTvChannel = channel.toLowerCase().includes('tv');

      if (filters.year === "all") {
        return metricType === "rating" && isTvChannel;
      }

      return (
        metricType === "rating" &&
        isTvChannel &&
        (txYear === parseInt(filters.year) || txYear === filters.year)
      );
    });

    const allChannels = [
      ...new Set(ratingData.map((record) => record.channel)),
    ];
    const monthMap = {};

    ratingData.forEach((record) => {
      const monthNum = record.txMonth || record.tx_month;
      const monthName = monthNames[monthNum] || `Month ${monthNum}`;
      const channel = record.channel;

      if (!monthMap[monthNum]) {
        monthMap[monthNum] = { month: monthName, monthNum: monthNum };
        allChannels.forEach((ch) => {
          monthMap[monthNum][ch] = null;
        });
      }

      const value = record.value || 0;
      monthMap[monthNum][channel] = value > 0 ? value : null;
    });

    const timeSeriesArray = Object.values(monthMap).sort((a, b) => {
      return parseInt(a.monthNum) - parseInt(b.monthNum);
    });

    setTvRatingOverTime(timeSeriesArray);
  };

  // Process Radio reach over time data for line chart
  const processRadioReachOverTime = (rawData) => {
    const monthNames = {
      1: "January",
      2: "February",
      3: "March",
      4: "April",
      5: "May",
      6: "June",
      7: "July",
      8: "August",
      9: "September",
      10: "October",
      11: "November",
      12: "December",
    };

    // Filter only reach data for Radio channels
    const reachData = rawData.filter((record) => {
      const metricType = record.metricType || record.metric_type;
      const txYear = record.txYear || record.tx_year;
      const channel = record.channel;
      const isRadioChannel = channel.toLowerCase().includes('fm');

      if (filters.year === "all") {
        return metricType === "reach" && isRadioChannel;
      }

      return (
        metricType === "reach" &&
        isRadioChannel &&
        (txYear === parseInt(filters.year) || txYear === filters.year)
      );
    });

    const allChannels = [...new Set(reachData.map((record) => record.channel))];
    const monthMap = {};

    reachData.forEach((record) => {
      const monthNum = record.txMonth || record.tx_month;
      const monthName = monthNames[monthNum] || `Month ${monthNum}`;
      const channel = record.channel;

      if (!monthMap[monthNum]) {
        monthMap[monthNum] = { month: monthName, monthNum: monthNum };
        allChannels.forEach((ch) => {
          monthMap[monthNum][ch] = 0;
        });
      }

      monthMap[monthNum][channel] = record.value || 0;
    });

    const timeSeriesArray = Object.values(monthMap).sort((a, b) => {
      return parseInt(a.monthNum) - parseInt(b.monthNum);
    });

    setRadioReachOverTime(timeSeriesArray);
  };

  // Process Radio rating over time data for line chart
  const processRadioRatingOverTime = (rawData) => {
    const monthNames = {
      1: "January",
      2: "February",
      3: "March",
      4: "April",
      5: "May",
      6: "June",
      7: "July",
      8: "August",
      9: "September",
      10: "October",
      11: "November",
      12: "December",
    };

    const ratingData = rawData.filter((record) => {
      const metricType = record.metricType || record.metric_type;
      const txYear = record.txYear || record.tx_year;
      const channel = record.channel;
      const isRadioChannel = channel.toLowerCase().includes('fm');

      if (filters.year === "all") {
        return metricType === "rating" && isRadioChannel;
      }

      return (
        metricType === "rating" &&
        isRadioChannel &&
        (txYear === parseInt(filters.year) || txYear === filters.year)
      );
    });

    const allChannels = [
      ...new Set(ratingData.map((record) => record.channel)),
    ];
    const monthMap = {};

    ratingData.forEach((record) => {
      const monthNum = record.txMonth || record.tx_month;
      const monthName = monthNames[monthNum] || `Month ${monthNum}`;
      const channel = record.channel;

      if (!monthMap[monthNum]) {
        monthMap[monthNum] = { month: monthName, monthNum: monthNum };
        allChannels.forEach((ch) => {
          monthMap[monthNum][ch] = null;
        });
      }

      const value = record.value || 0;
      monthMap[monthNum][channel] = value > 0 ? value : null;
    });

    const timeSeriesArray = Object.values(monthMap).sort((a, b) => {
      return parseInt(a.monthNum) - parseInt(b.monthNum);
    });

    setRadioRatingOverTime(timeSeriesArray);
  };

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchData();
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

      // Hide the export button temporarily
      const exportButton = document.querySelector(
        'button[title*="Opens print dialog"]'
      ) as HTMLElement | null;

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
      if (exportButton) exportButton.style.display = "";

      // Create an image to get dimensions
      const img = new Image();
      img.src = dataUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Create PDF - scale down to fit A4
      const scaleFactor = 0.45;
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

      // Center the image on the page (without additional auto-fit scaling)
      const xOffset = (pageWidth - scaledWidth) / 2;
      const yOffset = (pageHeight - scaledHeight) / 2;

      // Add image centered on the page
      pdf.addImage(dataUrl, "PNG", xOffset, yOffset, scaledWidth, scaledHeight);

      // Save PDF with dynamic filename
      const fileName = `ASTRO_Analytics_Export_${
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

  return (
    <>
      {/* Export Overlay - MUST be outside dashboard-container */}
      {isExporting && (
        <div
          className="export-overlay fixed inset-0 z-[100] flex items-center justify-center"
          style={{ minHeight: "100vh", height: "100%" }}
        >
          {/* Blurred backdrop - scrollable, extended to cover full document height */}
          <div
            className="absolute inset-0 bg-white/80 backdrop-blur-md"
            style={{ minHeight: "100vh", height: "100%", width: "100vw" }}
          ></div>

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

      {/* Subtle loading indicator at the top */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-purple-600 animate-pulse"></div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            ASTRO Analytics
          </h1>
          <p className="text-gray-600">
            Channel Rating & Reach Performance Analysis
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap items-center">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className={`${loading ? "animate-pulse" : ""}`}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={exportData}
            variant="outline"
            size="sm"
            title="Opens print dialog. Set Scale to 21 in More Settings for best results."
          >
            <Download className="h-4 w-4 mr-2" />
            Print/Export PDF
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Filters Section */}
        <Card className="">
          <CardHeader className="">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-700" />
                <CardTitle className="">Filters</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Year Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Year
                </label>
                <Select
                  value={filters.year}
                  onValueChange={(value) => handleFilterChange("year", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Channel Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Channel
                </label>
                <Select
                  value={filters.channel}
                  onValueChange={(value) =>
                    handleFilterChange("channel", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    {data?.filters?.channels?.map((channel) => (
                      <SelectItem key={channel} value={channel}>
                        {channel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Metric Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Metric Type
                </label>
                <Select
                  value={filters.metricType}
                  onValueChange={(value) =>
                    handleFilterChange("metricType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Metrics</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="reach">Reach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-3 text-gray-600">Loading ASTRO data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-800">
                <Activity className="h-5 w-5" />
                <span className="font-medium">Error loading data: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Channel Summary Cards */}
        {!loading && !error && channelSummary.length > 0 && (
          <div className="space-y-8">
            {/* TV Channels Section */}
            {channelSummary.filter(channel => 
              channel.channel.toLowerCase().includes('tv')
            ).length > 0 && (
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    TV Channel Performance Summary
                  </h2>
                  <p className="text-sm text-gray-600">
                    Rating and Total Reach by TV Channel for {filters.year}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full">
                  {channelSummary
                    .filter(channel => channel.channel.toLowerCase().includes('tv'))
                    .map((channel, index) => (
                      <Card
                        key={channel.channel}
                        className="hover:shadow-lg transition-shadow w-full"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            {/* Left Side: Channel Logo */}
                            <div className="flex-shrink-0">
                              {channel.logo ? (
                                <div className="w-32 h-32 relative rounded-lg overflow-hidden flex items-center justify-center">
                                  <NextImage
                                    src={channel.logo}
                                    alt={channel.channel}
                                    width={128}
                                    height={128}
                                    className="object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="w-32 h-32 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <TvIcon className="h-16 w-16 text-purple-600" />
                                </div>
                              )}
                            </div>

                            {/* Right Side: Metrics Stacked Vertically */}
                            <div className="flex-1 flex flex-col items-center space-y-4">
                              {/* Total Reach (Active Users) - Top */}
                              <div className="text-center">
                                <div
                                  className="text-4xl font-bold mb-1"
                                  style={{ color: "#00B4D8" }}
                                >
                                  {channel.totalReach}
                                </div>
                                <div
                                  className="text-sm font-medium"
                                  style={{ color: "#00B4D8" }}
                                >
                                  Active Users (Reach)
                                </div>
                              </div>

                              {/* Dividing Line */}
                              <div className="w-[200px] border-t-2 border-gray-300"></div>

                              {/* Rating (Programs) - Bottom */}
                              <div className="text-center">
                                <div
                                  className="text-4xl font-bold mb-1"
                                  style={{ color: "#E63946" }}
                                >
                                  {channel.avgRating}
                                </div>
                                <div
                                  className="text-sm font-medium"
                                  style={{ color: "#E63946" }}
                                >
                                  Average Rating
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Rank Badge at bottom if top 3 */}
                          {index < 3 && (
                            <div className="mt-[-10px] ml-10 text-start">
                              <Badge
                                variant="secondary"
                                className={`text-xs px-3 py-1 ${
                                  index === 0
                                    ? "bg-yellow-500 text-white"
                                    : index === 1
                                    ? "bg-gray-400 text-white"
                                    : "bg-amber-600 text-white"
                                }`}
                              >
                                #{index + 1}
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Radio Channels Section */}
            {channelSummary.filter(channel => 
              channel.channel.toLowerCase().includes('fm')
            ).length > 0 && (
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Radio Channel Performance Summary
                  </h2>
                  <p className="text-sm text-gray-600">
                    Rating and Total Reach by Radio Channel for {filters.year}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full">
                  {channelSummary
                    .filter(channel => channel.channel.toLowerCase().includes('fm'))
                    .map((channel, index) => (
                      <Card
                        key={channel.channel}
                        className="hover:shadow-lg transition-shadow w-full"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            {/* Left Side: Channel Logo */}
                            <div className="flex-shrink-0">
                              {channel.logo ? (
                                <div className="w-32 h-32 relative rounded-lg overflow-hidden flex items-center justify-center">
                                  <NextImage
                                    src={channel.logo}
                                    alt={channel.channel}
                                    width={128}
                                    height={128}
                                    className="object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="w-32 h-32 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <TvIcon className="h-16 w-16 text-purple-600" />
                                </div>
                              )}
                            </div>

                            {/* Right Side: Metrics Stacked Vertically */}
                            <div className="flex-1 flex flex-col items-center space-y-4">
                              {/* Total Reach (Active Users) - Top */}
                              <div className="text-center">
                                <div
                                  className="text-4xl font-bold mb-1"
                                  style={{ color: "#00B4D8" }}
                                >
                                  {channel.totalReach}
                                </div>
                                <div
                                  className="text-sm font-medium"
                                  style={{ color: "#00B4D8" }}
                                >
                                  Active Users (Reach)
                                </div>
                              </div>

                              {/* Dividing Line */}
                              <div className="w-[200px] border-t-2 border-gray-300"></div>

                              {/* Rating (Programs) - Bottom */}
                              <div className="text-center">
                                <div
                                  className="text-4xl font-bold mb-1"
                                  style={{ color: "#E63946" }}
                                >
                                  {channel.avgRating}
                                </div>
                                <div
                                  className="text-sm font-medium"
                                  style={{ color: "#E63946" }}
                                >
                                  Average Rating
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Rank Badge at bottom if top 3 */}
                          {index < 3 && (
                            <div className="mt-[-10px] ml-10 text-start">
                              <Badge
                                variant="secondary"
                                className={`text-xs px-3 py-1 ${
                                  index === 0
                                    ? "bg-yellow-500 text-white"
                                    : index === 1
                                    ? "bg-gray-400 text-white"
                                    : "bg-amber-600 text-white"
                                }`}
                              >
                                #{index + 1}
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TV Channels - Reach Over Time Line Chart */}
        {!loading && !error && tvReachOverTime.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                TV Channel Trends
              </h2>
              <p className="text-sm text-gray-600">
                Performance trends for TV channels
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="col-span-2">
                <CardHeader className="">
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span>TV Reach Over Time</span>
                  </CardTitle>
                  <CardDescription className="">
                    TV channel reach performance trends for {filters.year}
                  </CardDescription>
                </CardHeader>
                <CardContent className="">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={tvReachOverTime}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        label={{
                          value: "Month",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        label={{
                          value: "Reach",
                          angle: -90,
                          position: "insideLeft",
                        }}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          padding: "10px",
                        }}
                        labelFormatter={(value) => `Month: ${value}`}
                        formatter={(value, name) => [
                          value.toLocaleString(),
                          name,
                        ]}
                      />
                      <Legend />
                      {tvReachOverTime.length > 0 &&
                        Object.keys(tvReachOverTime[0])
                          .filter((key) => key !== "month" && key !== "monthNum")
                          .map((channel) => (
                            <Line
                              key={channel}
                              type="monotone"
                              dataKey={channel}
                              stroke={channelColors[channel] || "#6b7280"}
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TV Channels - Rating Over Time Line Chart */}
        {!loading && !error && tvRatingOverTime.length > 0 && (
          <div className="grid grid-cols-2 gap-6">
            <Card className="col-span-2">
              <CardHeader className="">
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>TV Rating Over Time</span>
                </CardTitle>
                <CardDescription className="">
                  TV channel rating performance trends for {filters.year}
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={tvRatingOverTime}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      label={{
                        value: "Month",
                        position: "insideBottom",
                        offset: -5,
                      }}
                    />
                    <YAxis
                      label={{
                        value: "Rating",
                        angle: -90,
                        position: "insideLeft",
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "10px",
                      }}
                      labelFormatter={(value) => `Month: ${value}`}
                      formatter={(value, name) => {
                        if (value === null || value === 0)
                          return ["No data", name];
                        return [value.toLocaleString(), name];
                      }}
                    />
                    <Legend />
                    {tvRatingOverTime.length > 0 &&
                      Object.keys(tvRatingOverTime[0])
                        .filter((key) => key !== "month" && key !== "monthNum")
                        .filter((channel) => {
                          return tvRatingOverTime.some(
                            (month) =>
                              month[channel] != null && month[channel] > 0
                          );
                        })
                        .map((channel) => (
                          <Line
                            key={channel}
                            type="monotone"
                            dataKey={channel}
                            stroke={channelColors[channel] || "#6b7280"}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                            connectNulls={false}
                          />
                        ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Radio Channels - Reach Over Time Line Chart */}
        {!loading && !error && radioReachOverTime.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Radio Channel Trends
              </h2>
              <p className="text-sm text-gray-600">
                Performance trends for Radio channels
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="col-span-2">
                <CardHeader className="">
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span>Radio Reach Over Time</span>
                  </CardTitle>
                  <CardDescription className="">
                    Radio channel reach performance trends for {filters.year}
                  </CardDescription>
                </CardHeader>
                <CardContent className="">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={radioReachOverTime}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        label={{
                          value: "Month",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        label={{
                          value: "Reach",
                          angle: -90,
                          position: "insideLeft",
                        }}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          padding: "10px",
                        }}
                        labelFormatter={(value) => `Month: ${value}`}
                        formatter={(value, name) => [
                          value.toLocaleString(),
                          name,
                        ]}
                      />
                      <Legend />
                      {radioReachOverTime.length > 0 &&
                        Object.keys(radioReachOverTime[0])
                          .filter((key) => key !== "month" && key !== "monthNum")
                          .map((channel) => (
                            <Line
                              key={channel}
                              type="monotone"
                              dataKey={channel}
                              stroke={channelColors[channel] || "#6b7280"}
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Radio Channels - Rating Over Time Line Chart */}
        {!loading && !error && radioRatingOverTime.length > 0 && (
          <div className="grid grid-cols-2 gap-6">
            <Card className="col-span-2">
              <CardHeader className="">
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Radio Rating Over Time</span>
                </CardTitle>
                <CardDescription className="">
                  Radio channel rating performance trends for {filters.year}
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={radioRatingOverTime}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      label={{
                        value: "Month",
                        position: "insideBottom",
                        offset: -5,
                      }}
                    />
                    <YAxis
                      label={{
                        value: "Rating",
                        angle: -90,
                        position: "insideLeft",
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "10px",
                      }}
                      labelFormatter={(value) => `Month: ${value}`}
                      formatter={(value, name) => {
                        if (value === null || value === 0)
                          return ["No data", name];
                        return [value.toLocaleString(), name];
                      }}
                    />
                    <Legend />
                    {radioRatingOverTime.length > 0 &&
                      Object.keys(radioRatingOverTime[0])
                        .filter((key) => key !== "month" && key !== "monthNum")
                        .filter((channel) => {
                          return radioRatingOverTime.some(
                            (month) =>
                              month[channel] != null && month[channel] > 0
                          );
                        })
                        .map((channel) => (
                          <Line
                            key={channel}
                            type="monotone"
                            dataKey={channel}
                            stroke={channelColors[channel] || "#6b7280"}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                            connectNulls={false}
                          />
                        ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && channelSummary.length === 0 && (
          <Card className="border-gray-200">
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No data available</p>
                <p className="text-sm mt-2">
                  Try adjusting your filters or check back later
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </>
  );
};

export default ASTROPage;
