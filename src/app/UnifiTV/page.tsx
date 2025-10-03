"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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

const UnifiTVPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [showCompareChannels, setShowCompareChannels] = useState(false);

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
    monthYear: "202505",
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

      // Also fetch all-time data for trends (without month filter)
      const trendsParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (key !== "monthYear" && value && value !== "all") {
          trendsParams.append(key, value);
        }
      });

      const [response, trendsResponse] = await Promise.all([
        fetch(`/api/unifi-viewership?${params}`),
        fetch(`/api/unifi-viewership?${trendsParams}`),
      ]);

      if (!response.ok || !trendsResponse.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const trendsResult = await trendsResponse.json();

      // Combine the results - use filtered data for most charts, but all-time data for trends
      setData({
        ...result,
        analytics: {
          ...result.analytics,
          monthlyTrends: trendsResult.analytics.monthlyTrends, // Use unfiltered trends
        },
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
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
      monthYear: "202505",
      channel: "all",
      programName: "",
      dateFrom: "",
      dateTo: "",
      sortBy: "mau",
      sortOrder: "desc",
    });
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

    const width = 700;
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
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
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
        }}
      >
        <svg
          width={width}
          height={height}
          style={{ width: "100%", height: "100%", overflow: "visible" }}
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
            const color = channelData.channel === "TV1" ? "#3b82f6" : "#10b981";
            const lightColor =
              channelData.channel === "TV1" ? "#3b82f640" : "#10b98140";
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

            {/* Main Story */}
            <div
              style={{
                marginBottom: "12px",
                padding: "10px",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                borderLeft: "4px solid #3b82f6",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "#1e40af",
                  marginBottom: "6px",
                }}
              >
                📊 What This Chart Shows:
              </div>
              <div
                style={{
                  color: "#374151",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
              >
                This box shows how many people watch {hoveredChannel.channel}{" "}
                programs each month. Think of it like counting visitors to
                different shops on your street.
              </div>
            </div>

            {/* Performance Summary */}
            <div
              style={{
                marginBottom: "12px",
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
                  marginBottom: "6px",
                }}
              >
                🎯 {hoveredChannel.channel} Performance Summary:
              </div>
              <div
                style={{
                  color: "#4b5563",
                  fontSize: "13px",
                  lineHeight: "1.4",
                }}
              >
                • <strong>Most Popular Show:</strong>{" "}
                {hoveredChannel.max
                  ? Math.round(hoveredChannel.max).toLocaleString()
                  : "N/A"}{" "}
                viewers
                <br />• <strong>Typical Show:</strong>{" "}
                {hoveredChannel.median
                  ? Math.round(hoveredChannel.median).toLocaleString()
                  : "N/A"}{" "}
                viewers
                <br />• <strong>Overall Average:</strong>{" "}
                {hoveredChannel.average
                  ? Math.round(hoveredChannel.average).toLocaleString()
                  : "N/A"}{" "}
                viewers
                <br />• <strong>Least Popular:</strong>{" "}
                {hoveredChannel.min
                  ? Math.round(hoveredChannel.min).toLocaleString()
                  : "N/A"}{" "}
                viewers
              </div>
            </div>

            {/* Easy Explanation */}
            <div
              style={{
                padding: "10px",
                backgroundColor: "#fefce8",
                borderRadius: "8px",
                border: "1px solid #fbbf24",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "#92400e",
                  marginBottom: "4px",
                }}
              >
                💡 In Simple Terms:
              </div>
              <div
                style={{
                  color: "#78350f",
                  fontSize: "12px",
                  lineHeight: "1.4",
                }}
              >
                {hoveredChannel.channel === "TV1"
                  ? "TV1 is like the main marketplace - it has a wide variety of shows that attract different numbers of people throughout the month."
                  : "TV2 is like a specialty store - it focuses on specific content that appeals to particular audiences."}
                {hoveredChannel.median && hoveredChannel.average && (
                  <div style={{ marginTop: "6px" }}>
                    {hoveredChannel.median > hoveredChannel.average
                      ? "📈 Most shows perform better than average - this is good consistency!"
                      : "📊 A few very popular shows boost the overall performance."}
                  </div>
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCwIcon className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600">Loading Unifi TV data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-6 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center space-x-3">
              <WifiIcon className="h-8 w-8 text-emerald-600" />
              <span>Unifi TV Analytics</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Program viewership and MAU analytics for Unifi TV platform
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge
              variant="outline"
              className={
                loading
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }
            >
              {loading ? "Syncing..." : "Live Data"}
            </Badge>
            <span className="text-sm text-gray-500">
              Updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              ⚠️ Data loading issue: {error}. Displaying with sample data.
            </p>
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="flex flex-wrap items-center gap-6">
          {/* Time Period */}
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-5 w-5 text-emerald-600" />
            <label className="text-sm font-semibold text-gray-700">
              Period:
            </label>
            <Select
              value={filters.monthYear}
              onValueChange={(value) => handleFilterChange("monthYear", value)}
            >
              <SelectTrigger className="w-36 bg-white/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month.slice(0, 4)}-{month.slice(4)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Channel Filter */}
          <div className="flex items-center space-x-3">
            <TvIcon className="h-5 w-5 text-emerald-600" />
            <label className="text-sm font-semibold text-gray-700">
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
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                {availableChannels.map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {channel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Program Name Filter */}
          <div className="flex items-center space-x-3">
            <PlayCircleIcon className="h-5 w-5 text-emerald-600" />
            <label className="text-sm font-semibold text-gray-700">
              Program:
            </label>
            <input
              type="text"
              placeholder="Search programs..."
              value={filters.programName}
              onChange={(e) =>
                handleFilterChange("programName", e.target.value)
              }
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white/80 text-sm w-40"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={applyFilters}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <FilterIcon className="h-4 w-4 mr-1" />
              Apply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Hero Stats */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">
                  Total MAU
                </CardTitle>
                <UsersIcon className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.summary.totalMau.toLocaleString()}
                </div>
                <div className="flex items-center mt-2 text-sm opacity-90">
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  Active users this period
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">
                  Total Programs
                </CardTitle>
                <PlayCircleIcon className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.summary.totalPrograms}
                </div>
                <div className="flex items-center mt-2 text-sm opacity-90">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  Unique programs aired
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">
                  Avg MAU per Program
                </CardTitle>
                <BarChart3Icon className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.summary.avgMau.toLocaleString()}
                </div>
                <div className="flex items-center mt-2 text-sm opacity-90">
                  <TrendingUpIcon className="h-4 w-4 mr-1" />
                  Average engagement
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">
                  Active Channels
                </CardTitle>
                <TvIcon className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.summary.totalChannels}
                </div>
                <div className="flex items-center mt-2 text-sm opacity-90">
                  <ActivityIcon className="h-4 w-4 mr-1" />
                  Broadcasting channels
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Section */}
        {data && (
          <div className="space-y-6">
            {/* Top Programs by MAU - Full Width Row (2 columns) */}
            <Card className="bg-white/70 backdrop-blur-sm col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <StarIcon className="h-5 w-5 text-emerald-600" />
                    <span>Top Programs by MAU</span>
                  </div>
                  <Button
                    onClick={() => setShowCompareChannels(!showCompareChannels)}
                    variant={showCompareChannels ? "default" : "outline"}
                    size="sm"
                    className={
                      showCompareChannels
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                    }
                  >
                    Compare Channels
                  </Button>
                </CardTitle>
                <CardDescription>
                  {showCompareChannels
                    ? "Comparing top programs between TV1 and TV2 channels"
                    : "Most engaging programs in the selected period"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Programs by MAU Chart */}
                {data?.analytics?.topPrograms &&
                data.analytics.topPrograms.length > 0 ? (
                  showCompareChannels ? (
                    // Compare Channels View - Split Chart
                    <div className="grid grid-cols-2 gap-4">
                      {/* TV1 Programs */}
                      <div>
                        <h4 className="text-lg font-semibold text-center mb-4 text-blue-700 border-b border-blue-200 pb-2">
                          TV1 Top Programs
                        </h4>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart
                            data={data.analytics.topPrograms
                              .filter(
                                (program) => program.channelName === "TV1"
                              )
                              .slice(0, 10)}
                            margin={{
                              top: 5,
                              right: 15,
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
                                  return `${(value / 1000000).toFixed(1)}M`;
                                if (value >= 1000)
                                  return `${Math.round(value / 1000)}K`;
                                return value.toString();
                              }}
                            />
                            <YAxis
                              dataKey="programName"
                              type="category"
                              width={150}
                              tick={{ fontSize: 11 }}
                              tickFormatter={(value) => {
                                // Find max character length from TV2 programs as reference
                                const tv2Programs = data.analytics.topPrograms
                                  .filter(
                                    (program) => program.channelName === "TV2"
                                  )
                                  .slice(0, 10);
                                const maxTV2Length =
                                  tv2Programs.length > 0
                                    ? Math.max(
                                        ...tv2Programs.map(
                                          (p) => p.programName.length
                                        )
                                      )
                                    : 25;

                                // Truncate TV1 program names based on TV2 max length
                                if (value.length > maxTV2Length) {
                                  return (
                                    value.substring(0, maxTV2Length) + "..."
                                  );
                                }
                                return value;
                              }}
                            />
                            <Tooltip
                              formatter={(value) => [
                                value.toLocaleString(),
                                "MAU",
                              ]}
                              labelFormatter={(label) => `Program: ${label}`}
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                border: "none",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              }}
                            />
                            <Bar
                              dataKey="mau"
                              fill="#3b82f6"
                              radius={[0, 4, 4, 0]}
                              stroke="#2563eb"
                              strokeWidth={1}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* TV2 Programs */}
                      <div>
                        <h4 className="text-lg font-semibold text-center mb-4 text-red-700 border-b border-red-200 pb-2">
                          TV2 Top Programs
                        </h4>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart
                            data={data.analytics.topPrograms
                              .filter(
                                (program) => program.channelName === "TV2"
                              )
                              .slice(0, 10)}
                            margin={{
                              top: 5,
                              right: 15,
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
                                  return `${(value / 1000000).toFixed(1)}M`;
                                if (value >= 1000)
                                  return `${Math.round(value / 1000)}K`;
                                return value.toString();
                              }}
                            />
                            <YAxis
                              dataKey="programName"
                              type="category"
                              width={150}
                              tick={{ fontSize: 11 }}
                            />
                            <Tooltip
                              formatter={(value) => [
                                value.toLocaleString(),
                                "MAU",
                              ]}
                              labelFormatter={(label) => `Program: ${label}`}
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                border: "none",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              }}
                            />
                            <Bar
                              dataKey="mau"
                              fill="#ef4444"
                              radius={[0, 4, 4, 0]}
                              stroke="#dc2626"
                              strokeWidth={1}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    // Regular View - Single Chart
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
                              return `${(value / 1000000).toFixed(1)}M`;
                            if (value >= 1000)
                              return `${Math.round(value / 1000)}K`;
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
                        <Bar
                          dataKey="mau"
                          fill="#10b981"
                          radius={[0, 4, 4, 0]}
                          stroke="#059669"
                          strokeWidth={1}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
                    <div className="text-center text-gray-500">
                      <BarChart3Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No program data available</p>
                    </div>
                  </div>
                )}

                {(!data?.analytics?.topPrograms ||
                  data.analytics.topPrograms.length === 0) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded">
                    <div className="text-center text-gray-500">
                      <BarChart3Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No program data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* MAU Trends Over Time - Full Width Row (2 columns) */}
            <Card className="bg-white/70 backdrop-blur-sm col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUpIcon className="h-5 w-5 text-teal-600" />
                  <span>MAU Trends Over Time</span>
                </CardTitle>
                <CardDescription>
                  Monthly active users progression across all periods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={data.analytics.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                    <XAxis dataKey="displayMonth" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={(value) => {
                        if (value >= 1000000)
                          return `${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000)
                          return `${Math.round(value / 1000)}K`;
                        return value.toString();
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => [value.toLocaleString(), "MAU"]}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalMau"
                      stroke="#0d9488"
                      fill="#14b8a6"
                      fillOpacity={0.6}
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Other Charts - 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Channel Performance */}
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TvIcon className="h-5 w-5 text-cyan-600" />
                    <span>Channel Performance</span>
                  </CardTitle>
                  <CardDescription>MAU distribution by channel</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={data.analytics.channelBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ channelName, totalMau }) =>
                          `${channelName}: ${(totalMau / 1000).toFixed(0)}K`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="totalMau"
                      >
                        {data.analytics.channelBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          value.toLocaleString(),
                          "Total MAU",
                        ]}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Box Plot MAU Distribution */}
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3Icon className="h-5 w-5 text-blue-600" />
                    <span>MAU Statistical Distribution</span>
                  </CardTitle>
                  <CardDescription>
                    Box and Whiskers Chart: Min, Max, Median, Average of MAU by
                    Channel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    style={{
                      width: "100%",
                      height: "350px",
                      position: "relative",
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
                      <div className="flex items-center justify-center h-full text-gray-500">
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
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PlayCircleIcon className="h-5 w-5 text-emerald-600" />
                <span>Program Details</span>
              </CardTitle>
              <CardDescription>
                Detailed breakdown of programs with MAU performance
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                              onMouseEnter={() => setShowInfoTooltip(true)}
                              onMouseLeave={() => setShowInfoTooltip(false)}
                            />
                            {showInfoTooltip && (
                              <div
                                className="fixed w-64 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-gray-700 pointer-events-none"
                                style={{
                                  zIndex: 99999,
                                  top: "0px",
                                  right: "20px",
                                }}
                              >
                                <div className="text-left">
                                  <div className="font-semibold mb-1 text-yellow-300">
                                    Performance Levels:
                                  </div>
                                  <div className="mb-1">
                                    🟢 High: &gt; 5,000 MAU
                                  </div>
                                  <div className="mb-1">
                                    🟡 Medium: 2,001 - 5,000 MAU
                                  </div>
                                  <div>🔴 Low: ≤ 2,000 MAU</div>
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
                              {program.avgDurationMinutes || 0} min
                            </td>
                            <td className="p-3 text-center">
                              <Badge
                                variant={
                                  (program.avgMau || 0) > 5000
                                    ? "default"
                                    : (program.avgMau || 0) > 2000
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {(program.avgMau || 0) > 5000
                                  ? "High"
                                  : (program.avgMau || 0) > 2000
                                  ? "Medium"
                                  : "Low"}
                              </Badge>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="p-3 text-center text-gray-500"
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
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <StarIcon className="h-5 w-5 text-amber-600" />
                <span>Key Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
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
  );
};

export default UnifiTVPage;
