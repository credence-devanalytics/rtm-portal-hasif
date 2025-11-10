"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
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
  CalendarIcon,
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
  WifiIcon,
  FilterIcon,
  RefreshCwIcon,
  InfoIcon,
  Download,
  RefreshCw,
} from "lucide-react";

// Import recharts components
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

// Import custom components
import UnifiCompareChannelsChart from "@/components/Multiplatform/UnifiCompareChannelsChart";

const UnifiTVPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Calculate dynamic performance thresholds based on peak MAU
  const performanceThresholds = useMemo(() => {
    if (!data?.analytics?.programBreakdown?.length) {
      return { high: 5000, medium: 2000 }; // Default fallback
    }

    // Find peak MAU from all programs
    const peakMAU = Math.max(
      ...data.analytics.programBreakdown.map((p) => p.avgMau || 0)
    );

    // Calculate thresholds:
    // High: >= 70% of peak MAU
    // Medium: >= 40% of peak MAU
    // Low: < 40% of peak MAU
    const highThreshold = Math.round(peakMAU * 0.7);
    const mediumThreshold = Math.round(peakMAU * 0.4);

    return {
      high: highThreshold,
      medium: mediumThreshold,
      peak: peakMAU,
    };
  }, [data?.analytics?.programBreakdown]);

  // Box Plot Hook for Channel MAU Distribution
  const useChannelBoxPlot = useMemo(() => {
    if (!data?.analytics?.topPrograms?.length) return null;

    const tv1Programs = data.analytics.topPrograms.filter(
      (p) => p.channelName === "TV1"
    );
    const tv2Programs = data.analytics.topPrograms.filter(
      (p) => p.channelName === "TV2"
    );

    const calculateStats = (programs) => {
      if (!programs.length) return null;

      const values = programs.map((p) => p.mau).sort((a, b) => a - b);
      const len = values.length;

      const q1 = values[Math.floor(len * 0.25)];
      const median =
        len % 2 === 0
          ? (values[len / 2 - 1] + values[len / 2]) / 2
          : values[Math.floor(len / 2)];
      const q3 = values[Math.floor(len * 0.75)];
      const min = Math.min(...values);
      const max = Math.max(...values);
      const average = values.reduce((sum, val) => sum + val, 0) / len;

      return { q1, median, q3, min, max, average };
    };

    return {
      TV1: calculateStats(tv1Programs),
      TV2: calculateStats(tv2Programs),
    };
  }, [data?.analytics?.topPrograms]);

  // Filters State
  const [filters, setFilters] = useState({
    monthYear: "202501",
    channel: "all",
    programName: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "mau",
    sortOrder: "desc",
  });

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
  const availableMonths = ["202501", "202502", "202503", "202504", "202505"];

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") params.append(key, value);
      });

      // Also fetch all-time data for trends and scatter plot (without month filter)
      const allTimeParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (key !== "monthYear" && value && value !== "all") {
          allTimeParams.append(key, value);
        }
      });

      const [response, allTimeResponse] = await Promise.all([
        fetch(`/api/unifi-viewership?${params}`),
        fetch(`/api/unifi-viewership?${allTimeParams}`),
      ]);

      if (!response.ok || !allTimeResponse.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error Response:", errorData);
        throw new Error(
          `HTTP error! status: ${response.status}${
            errorData.details ? ` - ${errorData.details}` : ""
          }`
        );
      }

      const result = await response.json();
      const allTimeResult = await allTimeResponse.json();

      // Check if we have valid data
      if (!result || !result.analytics) {
        throw new Error("Invalid data format received from API");
      }

      // Combine the results - use filtered data for most charts, but all-time data for trends and scatter
      setData({
        ...result,
        analytics: {
          ...result.analytics,
          monthlyTrends: allTimeResult.analytics?.monthlyTrends || [], // Use unfiltered trends
          allTimePrograms: allTimeResult.analytics?.topPrograms || [], // All programs across all months for scatter plot
        },
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch when filters change
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const applyFilters = () => {
    fetchData();
  };

  const resetFilters = () => {
    setFilters({
      monthYear: "202501",
      channel: "all",
      programName: "",
      dateFrom: "",
      dateTo: "",
      sortBy: "mau",
      sortOrder: "desc",
    });
  };

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
      const scaleFactor = 0.44;
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
      const fileName = `UnifiTV_Export_${
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

  // Custom Horizontal Box Plot Components - SVG-based approach with enhanced tooltip
  const CustomBoxPlot = ({ data }) => {
    const [hoveredChannel, setHoveredChannel] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    if (!data || data.length === 0) return null;

    const width = 600;
    const height = 300;
    const margin = { top: 50, right: 90, bottom: 50, left: 80 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // Calculate X scale (horizontal) with better range
    const allValues = data.flatMap((d) => [
      d.min,
      d.q1,
      d.median,
      d.q3,
      d.max,
      d.average,
    ]);
    const dataMin = Math.min(...allValues);
    const dataMax = Math.max(...allValues);
    const padding = (dataMax - dataMin) * 0.1; // 10% padding
    const minValue = Math.max(0, dataMin - padding); // Don't go below 0
    const maxValue = dataMax + padding;
    const xScale = (value) =>
      margin.left + ((value - minValue) / (maxValue - minValue)) * plotWidth;

    // Generate nice tick values
    const generateTicks = (min, max, count = 6) => {
      const range = max - min;
      const step = range / (count - 1);
      const magnitude = Math.pow(10, Math.floor(Math.log10(step)));
      const normalizedStep = Math.ceil(step / magnitude) * magnitude;

      const ticks = [];
      const start = Math.ceil(min / normalizedStep) * normalizedStep;
      for (let i = 0; i < count; i++) {
        const value = start + i * normalizedStep;
        if (value <= max) ticks.push(value);
      }
      return ticks;
    };

    const xTicks = generateTicks(minValue, maxValue);

    // Format large numbers
    const formatValue = (value) => {
      if (value >= 1000000) return `${(Number(value) / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(Number(value) / 1000).toFixed(0)}K`;
      return value.toFixed(0);
    };

    const handleMouseMove = (e, channelData) => {
      // Get the container bounds for relative positioning
      const container = e.currentTarget.closest(
        'div[style*="position: relative"]'
      );
      const rect = container
        ? container.getBoundingClientRect()
        : e.currentTarget.getBoundingClientRect();

      // Calculate position relative to the container
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;

      // Keep tooltip within reasonable bounds
      const tooltipWidth = 400; // max width of tooltip
      const tooltipHeight = 300; // estimated height

      let x = relativeX + 20; // offset from cursor
      let y = relativeY - 200;

      // Adjust if tooltip would go outside container
      if (x + tooltipWidth > rect.width) {
        x = relativeX - tooltipWidth - 20; // show on left side of cursor
      }

      if (y < 0) {
        y = relativeY + 20; // show below cursor
      }

      if (y + tooltipHeight > rect.height) {
        y = rect.height - tooltipHeight - 20;
      }

      setMousePos({ x, y });
      setHoveredChannel(channelData);
    };

    const handleMouseLeave = () => {
      setHoveredChannel(null);
    };

    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "400px",
          overflow: "visible",
          display: "flex",
          justifyContent: "start",
          marginRight: "0.5rem",
        }}
      >
        <svg
          width={width}
          height={height}
          style={{ maxWidth: "500px", height: "100%", overflow: "visible" }}
        >
          {/* Background */}
          <rect width="100%" height="100%" fill="none" />

          {/* Plot area background */}
          <rect
            x={margin.left}
            y={margin.top}
            width={plotWidth}
            height={plotHeight}
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="1"
          />

          {/* Vertical grid lines - Made more visible */}
          {xTicks.map((tick) => {
            const x = xScale(tick);
            return (
              <line
                key={tick}
                x1={x}
                y1={margin.top}
                x2={x}
                y2={margin.top + plotHeight}
                stroke="#d1d5db"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.7"
              />
            );
          })}

          {/* Horizontal grid lines for channels */}
          {data.map((_, index) => {
            const y =
              margin.top + (plotHeight / (data.length + 1)) * (index + 1);
            return (
              <line
                key={`hgrid-${index}`}
                x1={margin.left}
                y1={y}
                x2={margin.left + plotWidth}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.5"
              />
            );
          })}

          {/* Y-axis (left side) */}
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={margin.top + plotHeight}
            stroke="#6b7280"
            strokeWidth="2"
          />

          {/* X-axis (bottom) */}
          <line
            x1={margin.left}
            y1={margin.top + plotHeight}
            x2={margin.left + plotWidth}
            y2={margin.top + plotHeight}
            stroke="#6b7280"
            strokeWidth="2"
          />

          {/* X-axis ticks and labels */}
          {xTicks.map((tick) => {
            const x = xScale(tick);
            return (
              <g key={tick}>
                <line
                  x1={x}
                  y1={margin.top + plotHeight}
                  x2={x}
                  y2={margin.top + plotHeight + 5}
                  stroke="#6b7280"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={margin.top + plotHeight + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#6b7280"
                  fontFamily="system-ui"
                >
                  {formatValue(tick)}
                </text>
              </g>
            );
          })}

          {/* X-axis title */}
          <text
            x={margin.left + plotWidth / 2}
            y={height - 5}
            textAnchor="middle"
            fontSize="12"
            fill="#374151"
            fontWeight="600"
          >
            MAU (Monthly Active Users)
          </text>

          {/* Box plots for each channel (horizontal) */}
          {data.map((channelData, index) => {
            const color = channelData.channel === "TV1" ? "#102D84" : "#FE5400";
            const lightColor =
              channelData.channel === "TV1" ? "#102D8440" : "#FE540040";
            const centerY =
              margin.top + (plotHeight / (data.length + 1)) * (index + 1);
            const boxHeight = 60;
            const whiskerHeight = 30;

            const minX = xScale(channelData.min);
            const q1X = xScale(channelData.q1);
            const medianX = xScale(channelData.median);
            const q3X = xScale(channelData.q3);
            const maxX = xScale(channelData.max);
            const avgX = xScale(channelData.average);

            const isHovered = hoveredChannel?.channel === channelData.channel;

            return (
              <g key={channelData.channel}>
                {/* Whisker lines */}
                <line
                  x1={minX}
                  y1={centerY}
                  x2={q1X}
                  y2={centerY}
                  stroke={color}
                  strokeWidth={isHovered ? 3 : 2}
                />
                <line
                  x1={q3X}
                  y1={centerY}
                  x2={maxX}
                  y2={centerY}
                  stroke={color}
                  strokeWidth={isHovered ? 3 : 2}
                />

                {/* Min and Max caps */}
                <line
                  x1={minX}
                  y1={centerY - whiskerHeight / 2}
                  x2={minX}
                  y2={centerY + whiskerHeight / 2}
                  stroke={color}
                  strokeWidth={isHovered ? 3 : 2}
                />
                <line
                  x1={maxX}
                  y1={centerY - whiskerHeight / 2}
                  x2={maxX}
                  y2={centerY + whiskerHeight / 2}
                  stroke={color}
                  strokeWidth={isHovered ? 3 : 2}
                />

                {/* Box (Q1 to Q3) */}
                <rect
                  x={q1X}
                  y={centerY - boxHeight / 2}
                  width={q3X - q1X}
                  height={boxHeight}
                  fill={isHovered ? color + "30" : lightColor}
                  stroke={color}
                  strokeWidth={isHovered ? 3 : 2}
                  rx={3}
                />

                {/* Median line */}
                <line
                  x1={medianX}
                  y1={centerY - boxHeight / 2}
                  x2={medianX}
                  y2={centerY + boxHeight / 2}
                  stroke={color}
                  strokeWidth={isHovered ? 4 : 3}
                />

                {/* Average dot */}
                <circle
                  cx={avgX}
                  cy={centerY}
                  r={isHovered ? 7 : 5}
                  fill={color}
                  stroke="white"
                  strokeWidth={2}
                />

                {/* Channel label (on the left) */}
                <text
                  x={margin.left - 10}
                  y={centerY + 4}
                  textAnchor="end"
                  fontSize="14"
                  fill="#374151"
                  fontWeight={isHovered ? "700" : "600"}
                  fontFamily="system-ui"
                >
                  {channelData.channel}
                </text>

                {/* Interactive hover area */}
                <rect
                  x={margin.left}
                  y={centerY - boxHeight / 2 - 10}
                  width={plotWidth}
                  height={boxHeight + 20}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseMove={(e) => handleMouseMove(e, channelData)}
                  onMouseLeave={handleMouseLeave}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip for Box Plot */}
        {hoveredChannel && (
          <div
            style={{
              position: "absolute",
              left: mousePos.x,
              top: mousePos.y,
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              border: "2px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "12px",
              boxShadow:
                "0 20px 40px -3px rgba(0, 0, 0, 0.2), 0 8px 12px -2px rgba(0, 0, 0, 0.1)",
              padding: "16px 20px",
              fontSize: "14px",
              fontFamily: "system-ui",
              zIndex: 2147483647,
              minWidth: "320px",
              maxWidth: "400px",
              pointerEvents: "none",
              backdropFilter: "blur(12px)",
              transform: "translateZ(0)",
            }}
          >
            <div
              style={{
                fontWeight: "700",
                marginBottom: "12px",
                color: "#1e40af",
                borderBottom: "2px solid #e5e7eb",
                paddingBottom: "8px",
                fontSize: "16px",
              }}
            >
              📺 {hoveredChannel.channel} Channel Performance
            </div>

            {/* What This Means (Plain English) */}
            <div
              style={{
                marginBottom: "10px",
                padding: "10px",
                backgroundColor: "#f0f9ff",
                borderRadius: "8px",
                borderLeft: "4px solid #0ea5e9",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "#0c4a6e",
                  marginBottom: "6px",
                  fontSize: "13px",
                }}
              >
                📖 What This Shows:
              </div>
              <div
                style={{
                  color: "#075985",
                  fontSize: "12px",
                  lineHeight: "1.6",
                }}
              >
                This chart shows how popular different programs are on{" "}
                {hoveredChannel.channel}. The <strong>box</strong> contains the
                middle 50% of programs, the <strong>line in the box</strong> is
                the typical program, and the <strong>whiskers</strong> (lines
                extending out) show the range from least to most popular shows.
              </div>
            </div>

            {/* Performance Summary */}
            <div
              style={{
                marginBottom: "10px",
                padding: "10px",
                backgroundColor:
                  hoveredChannel.channel === "TV1" ? "#eff6ff" : "#ecfdf5",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px",
                  fontSize: "13px",
                }}
              >
                📊 Viewership Numbers (MAU):
              </div>
              <div
                style={{
                  color: "#4b5563",
                  fontSize: "12px",
                  lineHeight: "1.8",
                }}
              >
                <strong>Best:</strong>{" "}
                {hoveredChannel.max
                  ? Math.round(hoveredChannel.max).toLocaleString()
                  : "N/A"}{" "}
                <span style={{ color: "#9ca3af" }}>│</span>{" "}
                <strong>Top 25%:</strong>{" "}
                {hoveredChannel.q3
                  ? Math.round(hoveredChannel.q3).toLocaleString()
                  : "N/A"}{" "}
                <span style={{ color: "#9ca3af" }}>│</span>{" "}
                <strong>Typical:</strong>{" "}
                {hoveredChannel.median
                  ? Math.round(hoveredChannel.median).toLocaleString()
                  : "N/A"}
                <br />
                <strong>Average:</strong>{" "}
                {hoveredChannel.average
                  ? Math.round(hoveredChannel.average).toLocaleString()
                  : "N/A"}{" "}
                <span style={{ color: "#9ca3af" }}>│</span>{" "}
                <strong>Bottom 25%:</strong>{" "}
                {hoveredChannel.q1
                  ? Math.round(hoveredChannel.q1).toLocaleString()
                  : "N/A"}{" "}
                <span style={{ color: "#9ca3af" }}>│</span>{" "}
                <strong>Lowest:</strong>{" "}
                {hoveredChannel.min
                  ? Math.round(hoveredChannel.min).toLocaleString()
                  : "N/A"}
              </div>
            </div>

            {/* How to Read This Chart */}
            <div
              style={{
                padding: "10px",
                backgroundColor: "#fef3c7",
                borderRadius: "8px",
                borderLeft: "3px solid #f59e0b",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "#92400e",
                  marginBottom: "6px",
                  fontSize: "13px",
                }}
              >
                📊 Understanding the Data:
              </div>
              <div
                style={{
                  color: "#92400e",
                  fontSize: "12px",
                  lineHeight: "1.6",
                }}
              >
                {hoveredChannel.median && hoveredChannel.average && (
                  <>
                    {hoveredChannel.median > hoveredChannel.average
                      ? "The Typical program (median) is higher than the Average, meaning most programs perform consistently well, with fewer low-performing outliers affecting the average."
                      : "The Average is higher than the Typical program (median), indicating a few high-performing programs are pulling the average up, while most programs have lower viewership."}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCwIcon className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading Unifi TV data...</p>
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

      <div className="container mx-auto p-6 space-y-6 pt-16 dashboard-container">
      {/* Subtle loading indicator at the top */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-blue-600 animate-pulse"></div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center space-x-3">
            <WifiIcon className="h-8 w-8 text-primary" />
            <span>Unifi TV Analytics</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Program viewership and MAU analytics for Unifi TV platform
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            ⚠️ Data loading issue: {error}. Displaying with sample data.
          </p>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-card border border-border px-6 py-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6">
            {/* Time Period */}
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <label className="text-sm font-semibold text-foreground">
                Period:
              </label>
              <Select
                value={filters.monthYear}
                onValueChange={(value) => handleFilterChange("monthYear", value)}
              >
                <SelectTrigger className="w-36 bg-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="">
                  {availableMonths.map((month) => (
                    <SelectItem className="" key={month} value={month}>
                      {month.slice(0, 4)}-{month.slice(4)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Channel Filter */}
            <div className="flex items-center space-x-3">
              <TvIcon className="h-5 w-5 text-primary" />
              <label className="text-sm font-semibold text-foreground">
                Channel:
              </label>
              <Select
                value={filters.channel}
                onValueChange={(value) =>
                  handleFilterChange("channel", value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-40 bg-white/80">
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

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={applyFilters}
                variant="default"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <FilterIcon className="h-4 w-4 mr-1" />
                Apply
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Controls - Right Side */}
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
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Hero Stats */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* TV1 Combined Card */}
            <Card className="bg-white shadow-sm border-black col-span-1 md:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {/* Logo on the left */}
                  <div className="flex-shrink-0 pl-6 pr-4 py-1">
                    <img
                      src="/channel-logos/new-size-tv1.png"
                      alt="TV1 Logo"
                      className="h-32 w-32 object-contain"
                    />
                  </div>

                  {/* Stats on the right */}
                  <div className="flex-1 flex flex-col gap-2">
                    {/* Active Users (Total MAU) */}
                    <div className="space-y-1 text-center">
                      <div className="text-5xl font-bold text-blue-900">
                        {(
                          data.analytics.channelBreakdown?.find(
                            (ch) => ch.channelName === "TV1"
                          )?.totalMau || 0
                        ).toLocaleString()}
                      </div>
                      <div className="text-base font-medium text-blue-700">
                        Active Users
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-blue-300"></div>

                    {/* Viewers (Programs) */}
                    <div className="space-y-1 text-center">
                      <div className="text-5xl font-bold text-blue-900">
                        {data.analytics.topPrograms?.filter(
                          (p) => p.channelName === "TV1"
                        ).length || 0}
                      </div>
                      <div className="text-base font-medium text-blue-700">
                        Programs
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TV2 Combined Card */}
            <Card className="bg-white shadow-sm border-black col-span-1 md:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {/* Logo on the left */}
                  <div className="flex-shrink-0 pl-6 pr-4 py-1">
                    <img
                      src="/channel-logos/new-size-tv2.png"
                      alt="TV2 Logo"
                      className="h-40 w-40 object-contain"
                    />
                  </div>

                  {/* Stats on the right */}
                  <div className="flex-1 flex flex-col gap-2">
                    {/* Active Users (Total MAU) */}
                    <div className="space-y-1 text-center">
                      <div className="text-5xl font-bold text-orange-900">
                        {(
                          data.analytics.channelBreakdown?.find(
                            (ch) => ch.channelName === "TV2"
                          )?.totalMau || 0
                        ).toLocaleString()}
                      </div>
                      <div className="text-base font-medium text-orange-700">
                        Active Users
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-orange-300"></div>

                    {/* Viewers (Programs) */}
                    <div className="space-y-1 text-center">
                      <div className="text-5xl font-bold text-orange-900">
                        {data.analytics.topPrograms?.filter(
                          (p) => p.channelName === "TV2"
                        ).length || 0}
                      </div>
                      <div className="text-base font-medium text-orange-700">
                        Programs
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Section */}
        {data && (
          <div className="space-y-6">
            {/* Top Programs by MAU - Single Chart View */}
            <Card className="bg-card shadow-sm col-span-2">
              <CardHeader className="">
                <CardTitle className="flex items-center space-x-2">
                  <StarIcon className="h-5 w-5 text-primary" />
                  <span>Top Programs by MAU</span>
                </CardTitle>
                <CardDescription className="">
                  Most engaging programs in the selected period
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                {data?.analytics?.topPrograms &&
                data.analytics.topPrograms.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      width={500}
                      height={500}
                      data={data.analytics.topPrograms.slice(0, 10)}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        tickFormatter={(value) => {
                          if (value === 0) return "0";
                          if (value >= 1000000)
                            return `${(Number(value) / 1000000).toFixed(1)}M`;
                          if (value >= 1000)
                            return `${Math.round(Number(value) / 1000)}K`;
                          return value.toString();
                        }}
                      />
                      <YAxis
                        dataKey="programName"
                        type="category"
                        width={200}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value) => [value.toLocaleString(), "MAU"]}
                        labelFormatter={(label) => `Program: ${label}`}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar dataKey="mau" radius={[0, 4, 4, 0]} strokeWidth={1}>
                        {data.analytics.topPrograms
                          .slice(0, 10)
                          .map((entry, index) => {
                            // Define channel colors
                            const channelColors = {
                              TV1: "#102D84",
                              TV2: "#FE5400",
                              OKEY: "#00C49F",
                              "BERITA RTM": "#FF8042",
                              "SUKAN RTM": "#8884D8",
                              TV6: "#82CA9D",
                              BERNAMA: "#FFC658",
                            };
                            const fillColor =
                              channelColors[entry.channelName] || "#10b981";
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={fillColor}
                                stroke={fillColor}
                              />
                            );
                          })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-muted rounded">
                    <div className="text-center text-muted-foreground">
                      <BarChart3Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No program data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TV1 & TV2 Comparison Chart - Separate Component */}
            <UnifiCompareChannelsChart
              topPrograms={data.analytics.topPrograms || []}
              loading={false}
            />

            {/* MAU Trends Over Time - Full Width Row (2 columns) */}
            <Card className="bg-card shadow-sm col-span-2">
              <CardHeader className="items-start">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUpIcon className="h-5 w-5 text-accent" />
                  <span>MAU Trends Over Time</span>
                </CardTitle>
                <CardDescription className="">
                  Monthly active users progression for TV1 and TV2 channels
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={data.analytics.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                    <XAxis 
                      dataKey="displayMonth"
                      interval={0}
                      tick={(props) => {
                        const { x, y, payload } = props;
                        // Parse the displayMonth (format: "2024-01" or similar)
                        const dateStr = payload.value;
                        let month = '';
                        let year = '';
                        
                        if (dateStr) {
                          // Try to parse the date string
                          const parts = dateStr.split('-');
                          if (parts.length >= 2) {
                            const monthNum = parseInt(parts[1], 10);
                            year = parts[0];
                            const monthNames = [
                              'January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'
                            ];
                            month = monthNames[monthNum - 1] || '';
                          } else {
                            // Fallback if format is different
                            month = dateStr;
                          }
                        }
                        
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text
                              x={0}
                              y={0}
                              dy={16}
                              textAnchor="middle"
                              fill="#666"
                              fontSize={11}
                              fontWeight={500}
                            >
                              {month}
                            </text>
                            <text
                              x={0}
                              y={0}
                              dy={30}
                              textAnchor="middle"
                              fill="#666"
                              fontSize={11}
                            >
                              {year}
                            </text>
                          </g>
                        );
                      }}
                      height={60}
                    />
                    <YAxis
                      tickFormatter={(value) => {
                        if (value >= 1000000)
                          return `${(Number(value) / 1000000).toFixed(1)}M`;
                        if (value >= 1000)
                          return `${Math.round(Number(value) / 1000)}K`;
                        return value.toString();
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        const label =
                          name === "tv1Mau"
                            ? "TV1 MAU"
                            : name === "tv2Mau"
                            ? "TV2 MAU"
                            : "Total MAU";
                        return [value.toLocaleString(), label];
                      }}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: "20px" }}
                      formatter={(value) => {
                        if (value === "tv1Mau") return "TV1 MAU";
                        if (value === "tv2Mau") return "TV2 MAU";
                        return value;
                      }}
                    />
                    <Area
                      type="linear"
                      dataKey="tv1Mau"
                      stroke="#102D84"
                      fill="#102D84"
                      fillOpacity={0.5}
                      strokeWidth={3}
                      name="tv1Mau"
                    />
                    <Area
                      type="linear"
                      dataKey="tv2Mau"
                      stroke="#FE5400"
                      fill="#FE5400"
                      fillOpacity={0.5}
                      strokeWidth={3}
                      name="tv2Mau"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Other Charts - 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Channel Performance */}
              <Card className="bg-card shadow-sm">
                <CardHeader className="">
                  <CardTitle className="flex items-center space-x-2">
                    <TvIcon className="h-5 w-5 text-chart-1" />
                    <span>Program Duration vs MAU Analysis</span>
                  </CardTitle>
                  <CardDescription className="">
                    Relationship between average program duration and MAU
                    performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="">
                  <ResponsiveContainer width="100%" height={350}>
                    <ScatterChart
                      margin={{
                        top: 20,
                        right: 30,
                        bottom: 20,
                        left: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        dataKey="avgDuration"
                        name="Avg Duration"
                        label={{
                          value: "Average Duration (minutes)",
                          position: "insideBottom",
                          offset: -10,
                          fontSize: 12,
                        }}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        type="number"
                        dataKey="avgMau"
                        name="Avg MAU"
                        tickFormatter={(value) => {
                          if (value >= 1000000)
                            return `${(Number(value) / 1000000).toFixed(1)}M`;
                          if (value >= 1000)
                            return `${Math.round(Number(value) / 1000)}K`;
                          return value.toString();
                        }}
                        label={{
                          value: "Average MAU",
                          angle: -90,
                          position: "insideLeft",
                          fontSize: 12,
                        }}
                        tick={{ fontSize: 11 }}
                      />
                      <ZAxis range={[60, 400]} />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        formatter={(value, name) => {
                          if (name === "Avg MAU")
                            return [value.toLocaleString(), "Avg MAU"];
                          if (name === "Avg Duration")
                            return [value + " min", "Avg Duration"];
                          return [value, name];
                        }}
                        labelFormatter={(label) => `Program: ${label}`}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "10px" }} />
                      <Scatter
                        name="TV1 Programs"
                        data={(data.analytics.programBreakdown || [])
                          .filter(
                            (p) =>
                              p.channelName === "TV1" &&
                              p.avgDurationMinutes > 0
                          )
                          .map((program) => ({
                            avgDuration: program.avgDurationMinutes || 0,
                            avgMau: program.avgMau || 0,
                            programName: program.programName,
                            channelName: program.channelName,
                            episodeCount: program.episodeCount || 0,
                          }))}
                        fill="#102D84"
                        shape="circle"
                      />
                      <Scatter
                        name="TV2 Programs"
                        data={(data.analytics.programBreakdown || [])
                          .filter(
                            (p) =>
                              p.channelName === "TV2" &&
                              p.avgDurationMinutes > 0
                          )
                          .map((program) => ({
                            avgDuration: program.avgDurationMinutes || 0,
                            avgMau: program.avgMau || 0,
                            programName: program.programName,
                            channelName: program.channelName,
                            episodeCount: program.episodeCount || 0,
                          }))}
                        fill="#FE5400"
                        shape="circle"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Box Plot MAU Distribution */}
              <Card className="bg-card shadow-sm">
                <CardHeader className="">
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3Icon className="h-5 w-5 text-chart-2" />
                    <span>MAU Statistical Distribution</span>
                  </CardTitle>
                  <CardDescription className="">
                    Box and Whiskers Chart: Min, Max, Median, Average of MAU by
                    Channel
                  </CardDescription>
                </CardHeader>
                <CardContent className="">
                  <div
                    style={{
                      width: "100%",
                      height: "350px",
                      position: "relative",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {useChannelBoxPlot &&
                    (useChannelBoxPlot.TV1 || useChannelBoxPlot.TV2) ? (
                      <CustomBoxPlot
                        data={[
                          ...(useChannelBoxPlot.TV1
                            ? [
                                {
                                  channel: "TV1",
                                  min: useChannelBoxPlot.TV1.min,
                                  q1: useChannelBoxPlot.TV1.q1,
                                  median: useChannelBoxPlot.TV1.median,
                                  q3: useChannelBoxPlot.TV1.q3,
                                  max: useChannelBoxPlot.TV1.max,
                                  average: useChannelBoxPlot.TV1.average,
                                },
                              ]
                            : []),
                          ...(useChannelBoxPlot.TV2
                            ? [
                                {
                                  channel: "TV2",
                                  min: useChannelBoxPlot.TV2.min,
                                  q1: useChannelBoxPlot.TV2.q1,
                                  median: useChannelBoxPlot.TV2.median,
                                  q3: useChannelBoxPlot.TV2.q3,
                                  max: useChannelBoxPlot.TV2.max,
                                  average: useChannelBoxPlot.TV2.average,
                                },
                              ]
                            : []),
                        ]}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>No data available for box plot analysis</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Program Details Table */}
        {data && (
          <Card className="bg-white shadow-sm">
            <CardHeader className="">
              <CardTitle className="flex items-center space-x-2">
                <PlayCircleIcon className="h-5 w-5 text-emerald-600" />
                <span>Program Details</span>
              </CardTitle>
              <CardDescription className="">
                Detailed breakdown of programs with MAU performance
              </CardDescription>
            </CardHeader>
            <CardContent className="">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Program Name</th>
                      <th className="text-left p-3">Channel</th>
                      <th className="text-right p-3">Total MAU</th>
                      <th className="text-right p-3">Episodes</th>
                      <th className="text-right p-3">Avg MAU</th>
                      <th className="text-right p-3">Avg Duration</th>
                      <th className="text-center p-3">
                        <div className="flex items-center justify-center space-x-1">
                          <span>Performance</span>
                          <div className="relative">
                            <InfoIcon
                              className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help"
                              onMouseEnter={(e) => {
                                setShowInfoTooltip(true);
                                setTooltipPosition({
                                  x: e.clientX,
                                  y: e.clientY,
                                });
                              }}
                              onMouseMove={(e) => {
                                setTooltipPosition({
                                  x: e.clientX,
                                  y: e.clientY,
                                });
                              }}
                              onMouseLeave={() => setShowInfoTooltip(false)}
                            />
                            {showInfoTooltip && (
                              <div
                                className="fixed w-64 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-gray-700 pointer-events-none"
                                style={{
                                  zIndex: 99999,
                                  left: `${tooltipPosition.x - 280}px`,
                                  top: `${tooltipPosition.y - 100}px`,
                                }}
                              >
                                <div className="text-left">
                                  <div className="font-semibold mb-1 text-yellow-300">
                                    Performance Levels:
                                  </div>
                                  <div className="mb-1">
                                    🟢 High: ≥{" "}
                                    {performanceThresholds.high.toLocaleString()}{" "}
                                    MAU (
                                    {Math.round(
                                      (performanceThresholds.high /
                                        performanceThresholds.peak) *
                                        100
                                    )}
                                    % of peak)
                                  </div>
                                  <div className="mb-1">
                                    🟡 Medium:{" "}
                                    {performanceThresholds.medium.toLocaleString()}{" "}
                                    -{" "}
                                    {(
                                      performanceThresholds.high - 1
                                    ).toLocaleString()}{" "}
                                    MAU
                                  </div>
                                  <div className="mb-1">
                                    🔴 Low: &lt;{" "}
                                    {performanceThresholds.medium.toLocaleString()}{" "}
                                    MAU
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-gray-600 text-gray-300">
                                    Peak MAU:{" "}
                                    {performanceThresholds.peak.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.analytics?.programBreakdown &&
                    data.analytics.programBreakdown.length > 0 ? (
                      data.analytics.programBreakdown
                        .slice(0, 10)
                        .map((program, index) => (
                          <tr
                            key={`${program.programName}-${index}`}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-3 font-medium">
                              {program.programName || "N/A"}
                            </td>
                            <td className="p-3">
                              {program.channelName || "N/A"}
                            </td>
                            <td className="p-3 text-right">
                              {program.totalMau
                                ? program.totalMau.toLocaleString()
                                : "0"}
                            </td>
                            <td className="p-3 text-right">
                              {program.episodeCount || 0}
                            </td>
                            <td className="p-3 text-right">
                              {program.avgMau
                                ? program.avgMau.toLocaleString()
                                : "0"}
                            </td>
                            <td className="p-3 text-right">
                              {program.avgDurationMinutes || 0}
                            </td>
                            <td className="p-3 text-center">
                              <Badge
                                className=""
                                variant={
                                  (program.avgMau || 0) >=
                                  performanceThresholds.high
                                    ? "default"
                                    : (program.avgMau || 0) >=
                                      performanceThresholds.medium
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {(program.avgMau || 0) >=
                                performanceThresholds.high
                                  ? "High"
                                  : (program.avgMau || 0) >=
                                    performanceThresholds.medium
                                  ? "Medium"
                                  : "Low"}
                              </Badge>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-3 text-center text-muted-foreground"
                        >
                          No program data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Insights */}
        {data && (
          <Card className="bg-card shadow-sm">
            <CardHeader className="">
              <CardTitle className="flex items-center space-x-2">
                <StarIcon className="h-5 w-5 text-accent" />
                <span>Key Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-emerald-900 mb-2">
                    🏆 Top Performer
                  </h4>
                  <p className="text-sm text-emerald-700">
                    {data.analytics.topPrograms[0]?.programName} leads with{" "}
                    {data.analytics.topPrograms[0]?.mau.toLocaleString()} MAU
                  </p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-teal-900 mb-2">
                    📺 Channel Leader
                  </h4>
                  <p className="text-sm text-teal-700">
                    {data.analytics.channelBreakdown[0]?.channelName} dominates
                    with{" "}
                    {data.analytics.channelBreakdown[0]?.totalMau.toLocaleString()}{" "}
                    total MAU
                  </p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-cyan-900 mb-2">
                    📈 Platform Health
                  </h4>
                  <p className="text-sm text-cyan-700">
                    {data.summary.totalPrograms} programs across{" "}
                    {data.summary.totalChannels} channels
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

export default UnifiTVPage;
