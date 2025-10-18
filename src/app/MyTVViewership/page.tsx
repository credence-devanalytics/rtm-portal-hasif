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
  FilterIcon,
  RefreshCwIcon,
  Download,
} from "lucide-react";
import Header from "@/components/Header";

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

  // Filters State
  const [filters, setFilters] = useState({
    year: "all", // Changed from "2025" to "all" to show all years
    region: "all",
    channel: "all",
    sortBy: "viewers",
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
  const availableYears = ["2024", "2025", "2023", "2022"]; // Added more years
  const availableRegions = ["Semenanjung Malaysia", "Kota Kinabalu & Kuching"];

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") params.append(key, value);
      });

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
  }, [filters]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle filter changes
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
      year: "all", // Changed from "2025" to "all"
      region: "all",
      channel: "all",
      sortBy: "viewers",
      sortOrder: "desc",
    });
  };

  // Format number utility
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  // Export data function
  const exportData = () => {
    const dataToExport = {
      summary: data?.summary,
      channelBreakdown: data?.channelBreakdown,
      regionalBreakdown: data?.regionalBreakdown,
      data: data?.data,
      filters: filters,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mytv-viewership-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      <div className="p-6 max-w-7xl mx-auto">
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Header />

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
          {/* Year Filter */}
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-gray-600" />
            <Select
              value={filters.year}
              onValueChange={(value) => handleFilterChange("year", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="">
                <SelectItem className="" value="all">
                  All Years
                </SelectItem>
                {availableYears.map((year) => (
                  <SelectItem className="" key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <Button onClick={exportData} variant="outline" size="sm" className="">
            <Download className="h-4 w-4 mr-2" />
            Export
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
                    <div className="flex-shrink-0 pl-6 pr-4 py-1">
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
                          {/* TODO: Calculate TV1 viewers from mytv_v2_viewership */}
                          {formatNumber(
                            data.channelBreakdown?.find(
                              (ch) => ch.channel === "TV1"
                            )?.totalViewers || 0
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
                          {/* Program count from mytv_v2_top_programs */}
                          {data.channelBreakdown?.find(
                            (ch) => ch.channel === "TV1"
                          )?.programCount || 0}
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
                    <div className="flex-shrink-0 pl-6 pr-4 py-1">
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
                          {/* TODO: Calculate TV2 viewers from mytv_v2_viewership */}
                          {formatNumber(
                            data.channelBreakdown?.find(
                              (ch) => ch.channel === "TV2"
                            )?.totalViewers || 0
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
                          {/* Program count from mytv_v2_top_programs */}
                          {data.channelBreakdown?.find(
                            (ch) => ch.channel === "TV2"
                          )?.programCount || 0}
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
                    <div className="flex-shrink-0 pl-6 pr-4 py-1">
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
                          {/* TODO: Calculate TV6 viewers from mytv_v2_viewership */}
                          {formatNumber(
                            data.channelBreakdown?.find(
                              (ch) => ch.channel === "TV6"
                            )?.totalViewers || 0
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
                          {/* Program count from mytv_v2_top_programs */}
                          {data.channelBreakdown?.find(
                            (ch) => ch.channel === "TV6"
                          )?.programCount || 0}
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
                    <div className="flex-shrink-0 pl-6 pr-4 py-1">
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
                          {/* TODO: Calculate OKEY viewers from mytv_v2_viewership */}
                          {formatNumber(
                            data.channelBreakdown?.find(
                              (ch) => ch.channel === "OKEY"
                            )?.totalViewers || 0
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
                          {/* Program count from mytv_v2_top_programs */}
                          {data.channelBreakdown?.find(
                            (ch) => ch.channel === "OKEY"
                          )?.programCount || 0}
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
                    <div className="flex-shrink-0 pl-6 pr-4 py-1">
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
                          {/* TODO: Calculate SUKAN RTM viewers from mytv_v2_viewership */}
                          {formatNumber(
                            data.channelBreakdown?.find(
                              (ch) => ch.channel === "SUKAN RTM"
                            )?.totalViewers || 0
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
                          {/* Program count from mytv_v2_top_programs */}
                          {data.channelBreakdown?.find(
                            (ch) => ch.channel === "SUKAN RTM"
                          )?.programCount || 0}
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
                    <div className="flex-shrink-0 pl-6 pr-4 py-1">
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
                          {/* TODO: Calculate BERITA RTM viewers from mytv_v2_viewership */}
                          {formatNumber(
                            data.channelBreakdown?.find(
                              (ch) => ch.channel === "BERITA RTM"
                            )?.totalViewers || 0
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
                          {/* Program count from mytv_v2_top_programs */}
                          {data.channelBreakdown?.find(
                            (ch) => ch.channel === "BERITA RTM"
                          )?.programCount || 0}
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
                        <th className="text-right p-3 font-semibold">
                          Formatted
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
                          <td className="p-3 text-right text-gray-600">
                            {formatNumber(item.totalViewers)}
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
      <div className="grid gap-6 lg:grid-cols-1">
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
                    Showing {data.pagination.page} of{" "}
                    {data.pagination.totalPages} pages ({data.pagination.total}{" "}
                    total records)
                  </span>
                  <div className="flex space-x-2">
                    {data.pagination.hasPrev && (
                      <Button variant="outline" size="sm" className="">
                        Previous
                      </Button>
                    )}
                    {data.pagination.hasNext && (
                      <Button variant="outline" size="sm" className="">
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
  );
};

export default MyTVViewershipPage;
