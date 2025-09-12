"use client";

import React, { useState, useEffect } from "react";
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
} from "recharts";

const UnifiTVPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const fetchData = async () => {
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
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

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
                <CardTitle className="flex items-center space-x-2">
                  <StarIcon className="h-5 w-5 text-emerald-600" />
                  <span>Top Programs by MAU</span>
                </CardTitle>
                <CardDescription>
                  Most engaging programs in the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Programs by MAU Chart */}
                {data?.analytics?.topPrograms &&
                data.analytics.topPrograms.length > 0 ? (
                  <ResponsiveContainer width="100%" height={500}>
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

              {/* Program vs MAU Scatter */}
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3Icon className="h-5 w-5 text-blue-600" />
                    <span>Program Engagement Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    Average MAU vs Program Count by Channel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <ScatterChart data={data.analytics.channelBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                      <XAxis
                        dataKey="programCount"
                        name="Program Count"
                        type="number"
                      />
                      <YAxis dataKey="avgMau" name="Avg MAU" type="number" />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        formatter={(value, name) => [
                          name === "avgMau" ? value.toLocaleString() : value,
                          name === "avgMau" ? "Avg MAU" : "Program Count",
                        ]}
                        labelFormatter={(label, payload) =>
                          payload?.[0]?.payload?.channelName || ""
                        }
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Scatter dataKey="avgMau" fill="#3b82f6" />
                    </ScatterChart>
                  </ResponsiveContainer>
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
                      <th className="text-center p-3">Performance</th>
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
