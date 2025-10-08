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
} from "lucide-react";

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
    year: "2025",
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
  const availableYears = ["2024", "2025"];
  const availableRegions = [
    "Kuala Lumpur",
    "Selangor",
    "Johor",
    "Penang",
    "Sabah",
    "Sarawak",
  ];

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
      year: "2025",
      region: "all",
      channel: "all",
      sortBy: "viewers",
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCwIcon className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading MyTV viewership data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-6 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center space-x-3">
              <TvIcon className="h-8 w-8 text-blue-600" />
              <span>MyTV Viewership Analytics</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Channel viewership and MAU analytics for MyTV platform
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge
              variant="outline"
              className={
                loading
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
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
          {/* Year Filter */}
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <label className="text-sm font-semibold text-gray-700">Year:</label>
            <Select
              value={filters.year}
              onValueChange={(value) => handleFilterChange("year", value)}
            >
              <SelectTrigger className="w-32 bg-white/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="">
                {availableYears.map((year) => (
                  <SelectItem className="" key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Channel Filter */}
          <div className="flex items-center space-x-3">
            <TvIcon className="h-5 w-5 text-blue-600" />
            <label className="text-sm font-semibold text-gray-700">
              Channel:
            </label>
            <Select
              value={filters.channel}
              onValueChange={(value) => handleFilterChange("channel", value)}
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

          {/* Region Filter */}
          <div className="flex items-center space-x-3">
            <UsersIcon className="h-5 w-5 text-blue-600" />
            <label className="text-sm font-semibold text-gray-700">
              Region:
            </label>
            <Select
              value={filters.region}
              onValueChange={(value) => handleFilterChange("region", value)}
            >
              <SelectTrigger className="w-40 bg-white/80">
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

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={applyFilters}
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">
                  Total Viewers
                </CardTitle>
                <EyeIcon className="h-5 w-5" />
              </CardHeader>
              <CardContent className="">
                <div className="text-2xl font-bold">
                  {data.summary.totalViewers.toLocaleString()}
                </div>
                <div className="flex items-center mt-2 text-sm opacity-90">
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  Active viewers across all channels
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">
                  Active Channels
                </CardTitle>
                <TvIcon className="h-5 w-5" />
              </CardHeader>
              <CardContent className="">
                <div className="text-2xl font-bold">
                  {data.summary.totalChannels}
                </div>
                <div className="flex items-center mt-2 text-sm opacity-90">
                  <PlayCircleIcon className="h-4 w-4 mr-1" />
                  Broadcasting channels
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">
                  Coverage Regions
                </CardTitle>
                <ActivityIcon className="h-5 w-5" />
              </CardHeader>
              <CardContent className="">
                <div className="text-2xl font-bold">
                  {data.summary.totalRegions}
                </div>
                <div className="flex items-center mt-2 text-sm opacity-90">
                  <UsersIcon className="h-4 w-4 mr-1" />
                  Geographic coverage
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">
                  Avg Viewers per Channel
                </CardTitle>
                <BarChart3Icon className="h-5 w-5" />
              </CardHeader>
              <CardContent className="">
                <div className="text-2xl font-bold">
                  {data.summary.avgViewers.toLocaleString()}
                </div>
                <div className="flex items-center mt-2 text-sm opacity-90">
                  <TrendingUpIcon className="h-4 w-4 mr-1" />
                  Average engagement
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Bar Chart - MAU by Channels and Months */}
        {data && (
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader className="">
              <CardTitle className="flex items-center space-x-2">
                <BarChart3Icon className="h-5 w-5 text-blue-600" />
                <span>MAU by Channels Across Months</span>
              </CardTitle>
              <CardDescription className="">
                Monthly Active Users grouped by channels throughout the year
              </CardDescription>
            </CardHeader>
            <CardContent className="">
              {mauChartData && mauChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart
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
                      <Bar
                        key={channel}
                        dataKey={channel}
                        fill={COLORS[index % COLORS.length]}
                        name={channel}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
                  <div className="text-center text-gray-500">
                    <BarChart3Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No MAU data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Additional Charts Row */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Channel Performance Breakdown */}
            <Card className="bg-white/70 backdrop-blur-sm">
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
                  <PieChart>
                    <Pie
                      data={data.channelBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ channel, totalViewers }) =>
                        `${channel}: ${(totalViewers / 1000000).toFixed(1)}M`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="totalViewers"
                    >
                      {data.channelBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
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
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Regional Breakdown */}
            <Card className="bg-white/70 backdrop-blur-sm">
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
                {(() => {
                  const regions = data.regionalBreakdown || [];
                  const midPoint = Math.ceil(regions.length / 2);
                  const shouldSplit = regions.length > 3;
                  const leftRegions = shouldSplit
                    ? regions.slice(0, midPoint)
                    : regions;
                  const rightRegions = shouldSplit
                    ? regions.slice(midPoint)
                    : [];

                  return (
                    <div
                      className={`grid ${
                        shouldSplit ? "grid-cols-2" : "grid-cols-1"
                      } gap-4`}
                    >
                      {/* Left/Main Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-purple-50">
                              <th className="text-left p-3 font-semibold text-purple-900">
                                Region
                              </th>
                              <th className="text-right p-3 font-semibold text-purple-900">
                                Total Viewers
                              </th>
                              <th className="text-right p-3 font-semibold text-purple-900">
                                Formatted
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {leftRegions.map((item, index) => (
                              <tr
                                key={index}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="p-3 font-medium text-gray-700">
                                  {item.region}
                                </td>
                                <td className="p-3 text-right font-semibold text-purple-700">
                                  {item.totalViewers.toLocaleString()}
                                </td>
                                <td className="p-3 text-right text-gray-600">
                                  {item.totalViewers >= 1000000
                                    ? `${(item.totalViewers / 1000000).toFixed(
                                        1
                                      )}M`
                                    : item.totalViewers >= 1000
                                    ? `${Math.round(item.totalViewers / 1000)}K`
                                    : item.totalViewers.toString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Right Table (only if split) */}
                      {shouldSplit && rightRegions.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-purple-50">
                                <th className="text-left p-3 font-semibold text-purple-900">
                                  Region
                                </th>
                                <th className="text-right p-3 font-semibold text-purple-900">
                                  Total Viewers
                                </th>
                                <th className="text-right p-3 font-semibold text-purple-900">
                                  Formatted
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {rightRegions.map((item, index) => (
                                <tr
                                  key={index}
                                  className="border-b hover:bg-gray-50"
                                >
                                  <td className="p-3 font-medium text-gray-700">
                                    {item.region}
                                  </td>
                                  <td className="p-3 text-right font-semibold text-purple-700">
                                    {item.totalViewers.toLocaleString()}
                                  </td>
                                  <td className="p-3 text-right text-gray-600">
                                    {item.totalViewers >= 1000000
                                      ? `${(
                                          item.totalViewers / 1000000
                                        ).toFixed(1)}M`
                                      : item.totalViewers >= 1000
                                      ? `${Math.round(
                                          item.totalViewers / 1000
                                        )}K`
                                      : item.totalViewers.toString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Monthly Trends */}
        {data && (
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader className="">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUpIcon className="h-5 w-5 text-cyan-600" />
                <span>Monthly Viewership Trends</span>
              </CardTitle>
              <CardDescription className="">
                Overall viewership progression throughout the year
              </CardDescription>
            </CardHeader>
            <CardContent className="">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
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
                  <Area
                    type="monotone"
                    dataKey="totalViewers"
                    stroke="#06b6d4"
                    fill="#0891b2"
                    fillOpacity={0.6}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        {data && (
          <Card className="bg-white/70 backdrop-blur-sm">
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

        {/* Quick Insights */}
        {data && (
          <Card className="bg-white/70 backdrop-blur-sm">
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
                    {data.channelBreakdown?.[0]?.totalViewers?.toLocaleString()}{" "}
                    viewers
                  </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-900 mb-2">
                    📍 Top Region
                  </h4>
                  <p className="text-sm text-indigo-700">
                    {data.regionalBreakdown?.[0]?.region} dominates with{" "}
                    {data.regionalBreakdown?.[0]?.totalViewers?.toLocaleString()}{" "}
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
