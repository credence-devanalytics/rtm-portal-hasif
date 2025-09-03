"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  MonitorIcon,
  TvIcon,
  ActivityIcon,
  EyeIcon,
  ClockIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  WifiIcon,
  RadioIcon,
} from "lucide-react";
import useMultiplatformData from "../../hooks/useMultiplatformData";

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

const MultiplatformPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Global Filters State
  const [globalFilters, setGlobalFilters] = useState({
    monthYear: "202502",
    channels: [],
    platforms: ["mytv", "unifi"],
    region: "all",
  });

  // Fetch data using custom hook
  const { data, loading, error } = useMultiplatformData(globalFilters);

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
  const availableMonths = ["202501", "202502", "202503", "202504"];

  const handleFilterChange = (filterType, value) => {
    setGlobalFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleChannelToggle = (channel) => {
    setGlobalFilters((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    return {
      totalMytvViewers: data.mytvViewership?.summary?.totalViewers || 28500000,
      totalUnifiMau: data.unifiSummary?.summary?.totalMau || 518883,
      totalPrograms: data.unifiSummary?.summary?.totalRecords || 150,
      avgWatchTime: 45.2,
      growthRate: 12.5,
      activeChannels: data.mytvViewership?.summary?.totalChannels || 7,
    };
  }, [data]);

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

  // Mock trend data for overview charts
  const trendData = [
    { month: "Jan", mytv: 25000000, unifi: 450000 },
    { month: "Feb", mytv: 28500000, unifi: 518883 },
    { month: "Mar", mytv: 30200000, unifi: 560000 },
    { month: "Apr", mytv: 29800000, unifi: 575000 },
    { month: "May", mytv: 31200000, unifi: 590000 },
    { month: "Jun", mytv: 32500000, unifi: 610000 },
  ];

  // MyTV channel data
  const mytvChannelData = [
    { channel: "TV1", viewers: 8500000, growth: 12.5 },
    { channel: "TV2", viewers: 7200000, growth: 8.3 },
    { channel: "OKEY", viewers: 5800000, growth: -2.1 },
    { channel: "BERITA RTM", viewers: 3200000, growth: 15.7 },
    { channel: "SUKAN RTM", viewers: 2800000, growth: 22.4 },
    { channel: "TV6", viewers: 800000, growth: 5.2 },
    { channel: "BERNAMA", viewers: 200000, growth: 3.8 },
  ];

  // Unifi program data
  const unifiProgramData = [
    { program: "Program A", mau: 85000, duration: 45, genre: "Drama" },
    { program: "Program B", mau: 72000, duration: 38, genre: "News" },
    { program: "Program C", mau: 65000, duration: 52, genre: "Entertainment" },
    { program: "Program D", mau: 58000, duration: 42, genre: "Sports" },
    { program: "Program E", mau: 45000, duration: 35, genre: "Documentary" },
  ];

  // Platform distribution data
  const platformDistData = [
    { name: "MYTV", value: summaryStats.totalMytvViewers, color: "#0088FE" },
    { name: "Unifi TV", value: summaryStats.totalUnifiMau, color: "#00C49F" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-6 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Multi-Platform Analytics Hub
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive insights across MYTV & Unifi platforms
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
            <CalendarIcon className="h-5 w-5 text-indigo-600" />
            <label className="text-sm font-semibold text-gray-700">
              Period:
            </label>
            <Select
              value={globalFilters.monthYear}
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

          {/* Platform Toggle */}
          <div className="flex items-center space-x-3">
            <MonitorIcon className="h-5 w-5 text-indigo-600" />
            <label className="text-sm font-semibold text-gray-700">
              Platforms:
            </label>
            <div className="flex space-x-2">
              <Button
                variant={
                  globalFilters.platforms.includes("mytv")
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => {
                  const newPlatforms = globalFilters.platforms.includes("mytv")
                    ? globalFilters.platforms.filter((p) => p !== "mytv")
                    : [...globalFilters.platforms, "mytv"];
                  handleFilterChange("platforms", newPlatforms);
                }}
                className="text-xs"
              >
                <TvIcon className="h-4 w-4 mr-1" />
                MYTV
              </Button>
              <Button
                variant={
                  globalFilters.platforms.includes("unifi")
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => {
                  const newPlatforms = globalFilters.platforms.includes("unifi")
                    ? globalFilters.platforms.filter((p) => p !== "unifi")
                    : [...globalFilters.platforms, "unifi"];
                  handleFilterChange("platforms", newPlatforms);
                }}
                className="text-xs"
              >
                <WifiIcon className="h-4 w-4 mr-1" />
                Unifi
              </Button>
            </div>
          </div>

          {/* Channels */}
          <div className="flex items-center space-x-3">
            <BarChart3Icon className="h-5 w-5 text-indigo-600" />
            <label className="text-sm font-semibold text-gray-700">
              Channels:
            </label>
            <div className="flex flex-wrap gap-1">
              {availableChannels.map((channel) => (
                <Button
                  key={channel}
                  variant={
                    globalFilters.channels.includes(channel)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleChannelToggle(channel)}
                  className="text-xs px-2 py-1 h-8"
                >
                  {channel}
                </Button>
              ))}
            </div>
          </div>

          {/* Reset */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setGlobalFilters({
                monthYear: "202502",
                channels: [],
                platforms: ["mytv", "unifi"],
                region: "all",
              })
            }
            className="text-gray-500 hover:text-gray-700"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px] bg-white/80 backdrop-blur-sm">
            <TabsTrigger
              value="overview"
              className="flex items-center space-x-2"
            >
              <ActivityIcon className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="mytv" className="flex items-center space-x-2">
              <TvIcon className="h-4 w-4" />
              <span>MYTV</span>
            </TabsTrigger>
            <TabsTrigger value="unifi" className="flex items-center space-x-2">
              <WifiIcon className="h-4 w-4" />
              <span>Unifi</span>
            </TabsTrigger>
            <TabsTrigger
              value="comparison"
              className="flex items-center space-x-2"
            >
              <BarChart3Icon className="h-4 w-4" />
              <span>Compare</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">
                    Total MYTV Viewers
                  </CardTitle>
                  <TvIcon className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summaryStats.totalMytvViewers.toLocaleString()}
                  </div>
                  <div className="flex items-center mt-2 text-sm opacity-90">
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    12.5% from last month
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">
                    Unifi MAU
                  </CardTitle>
                  <WifiIcon className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summaryStats.totalUnifiMau.toLocaleString()}
                  </div>
                  <div className="flex items-center mt-2 text-sm opacity-90">
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    8.3% from last month
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">
                    Avg Watch Time
                  </CardTitle>
                  <ClockIcon className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summaryStats.avgWatchTime} min
                  </div>
                  <div className="flex items-center mt-2 text-sm opacity-90">
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    2.1% from last month
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">
                    Active Channels
                  </CardTitle>
                  <RadioIcon className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summaryStats.activeChannels}
                  </div>
                  <div className="flex items-center mt-2 text-sm opacity-90">
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    All platforms active
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Platform Trends */}
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUpIcon className="h-5 w-5 text-blue-600" />
                    <span>Platform Growth Trends</span>
                  </CardTitle>
                  <CardDescription>
                    Viewership growth across platforms over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="mytv"
                        stroke="#0088FE"
                        strokeWidth={3}
                        dot={{ fill: "#0088FE", strokeWidth: 2, r: 6 }}
                        name="MYTV Viewers"
                      />
                      <Line
                        type="monotone"
                        dataKey="unifi"
                        stroke="#00C49F"
                        strokeWidth={3}
                        dot={{ fill: "#00C49F", strokeWidth: 2, r: 6 }}
                        name="Unifi MAU"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Platform Distribution */}
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MonitorIcon className="h-5 w-5 text-emerald-600" />
                    <span>Platform Distribution</span>
                  </CardTitle>
                  <CardDescription>
                    Current audience share by platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={platformDistData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(1)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {platformDistData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          value.toLocaleString(),
                          "Audience",
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
            </div>

            {/* Recent Performance Insights */}
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <StarIcon className="h-5 w-5 text-amber-600" />
                  <span>Key Performance Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      📈 Top Growth
                    </h4>
                    <p className="text-sm text-blue-700">
                      SUKAN RTM leads with 22.4% viewer growth this month
                    </p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-emerald-900 mb-2">
                      🎯 High Engagement
                    </h4>
                    <p className="text-sm text-emerald-700">
                      Average watch time increased to 45.2 minutes
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">
                      🚀 Platform Health
                    </h4>
                    <p className="text-sm text-purple-700">
                      All 7 channels showing positive momentum
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MYTV Tab */}
          <TabsContent value="mytv" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                MYTV Analytics Deep Dive
              </h2>
              <p className="text-gray-600">
                Comprehensive channel performance and audience insights
              </p>
            </div>

            {/* MYTV Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Total Viewers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {summaryStats.totalMytvViewers.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Top Channel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">TV1</div>
                  <div className="text-sm opacity-90">8.5M viewers</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Growth Leader</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">SUKAN RTM</div>
                  <div className="text-sm opacity-90">+22.4% growth</div>
                </CardContent>
              </Card>
            </div>

            {/* MYTV Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Channel Performance */}
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Channel Viewership</CardTitle>
                  <CardDescription>
                    Current month viewer count by channel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={mytvChannelData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="channel" type="category" width={100} />
                      <Tooltip
                        formatter={(value) => [
                          value.toLocaleString(),
                          "Viewers",
                        ]}
                      />
                      <Bar dataKey="viewers" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Growth Analysis */}
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Growth Analysis</CardTitle>
                  <CardDescription>
                    Month-over-month growth percentage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={mytvChannelData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="channel"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, "Growth"]} />
                      <Bar
                        dataKey="growth"
                        fill={(data) =>
                          data.growth > 0 ? "#00C49F" : "#FF8042"
                        }
                      >
                        {mytvChannelData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.growth > 0 ? "#00C49F" : "#FF8042"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Channel Details Table */}
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Channel Performance Details</CardTitle>
                <CardDescription>
                  Comprehensive breakdown of all MYTV channels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Channel</th>
                        <th className="text-right p-3">Viewers</th>
                        <th className="text-right p-3">Growth</th>
                        <th className="text-right p-3">Market Share</th>
                        <th className="text-center p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mytvChannelData.map((channel, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{channel.channel}</td>
                          <td className="p-3 text-right">
                            {channel.viewers.toLocaleString()}
                          </td>
                          <td className="p-3 text-right">
                            <span
                              className={`inline-flex items-center ${
                                channel.growth > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {channel.growth > 0 ? (
                                <ArrowUpIcon className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowDownIcon className="h-4 w-4 mr-1" />
                              )}
                              {Math.abs(channel.growth)}%
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {(
                              (channel.viewers /
                                summaryStats.totalMytvViewers) *
                              100
                            ).toFixed(1)}
                            %
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              variant={
                                channel.growth > 10
                                  ? "default"
                                  : channel.growth > 0
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {channel.growth > 10
                                ? "High Growth"
                                : channel.growth > 0
                                ? "Growing"
                                : "Declining"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Unifi Tab */}
          <TabsContent value="unifi" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Unifi TV Analytics
              </h2>
              <p className="text-gray-600">
                Program-level engagement and content performance insights
              </p>
            </div>

            {/* Unifi Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Total MAU</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {summaryStats.totalUnifiMau.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Top Program</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">Program A</div>
                  <div className="text-sm opacity-90">85K MAU</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Avg Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">42 min</div>
                  <div className="text-sm opacity-90">Per program</div>
                </CardContent>
              </Card>
            </div>

            {/* Unifi Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Programs */}
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Top Programs by MAU</CardTitle>
                  <CardDescription>
                    Most engaged programs this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={unifiProgramData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="program" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [value.toLocaleString(), "MAU"]}
                      />
                      <Bar dataKey="mau" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* MAU vs Duration Scatter */}
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>MAU vs Duration</CardTitle>
                  <CardDescription>
                    Relationship between engagement and content length
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart data={unifiProgramData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="duration" name="Duration" unit=" min" />
                      <YAxis dataKey="mau" name="MAU" />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        formatter={(value, name) => [
                          name === "mau"
                            ? value.toLocaleString()
                            : `${value} min`,
                          name === "mau" ? "MAU" : "Duration",
                        ]}
                      />
                      <Scatter dataKey="mau" fill="#FFBB28" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Program Details */}
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Program Performance Analysis</CardTitle>
                <CardDescription>
                  Detailed breakdown of Unifi TV programs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Program</th>
                        <th className="text-right p-3">MAU</th>
                        <th className="text-right p-3">Duration</th>
                        <th className="text-left p-3">Genre</th>
                        <th className="text-right p-3">Engagement Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unifiProgramData.map((program, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{program.program}</td>
                          <td className="p-3 text-right">
                            {program.mau.toLocaleString()}
                          </td>
                          <td className="p-3 text-right">
                            {program.duration} min
                          </td>
                          <td className="p-3">{program.genre}</td>
                          <td className="p-3 text-right">
                            {(
                              (program.mau / summaryStats.totalUnifiMau) *
                              100
                            ).toFixed(1)}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Platform Comparison
              </h2>
              <p className="text-gray-600">
                Side-by-side analysis of MYTV and Unifi performance
              </p>
            </div>

            {/* Comparison Chart */}
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Platform Performance Comparison</CardTitle>
                <CardDescription>
                  Normalized comparison across key metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart
                    data={[
                      {
                        metric: "Audience",
                        mytv: 28500000,
                        unifi: 518883,
                        mytvNorm: 100,
                        unifiNorm: 100,
                      },
                      {
                        metric: "Growth",
                        mytv: 12.5,
                        unifi: 8.3,
                        mytvNorm: 60,
                        unifiNorm: 40,
                      },
                      {
                        metric: "Engagement",
                        mytv: 45.2,
                        unifi: 42.0,
                        mytvNorm: 52,
                        unifiNorm: 48,
                      },
                      {
                        metric: "Content Variety",
                        mytv: 7,
                        unifi: 150,
                        mytvNorm: 4,
                        unifiNorm: 96,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="mytvNorm"
                      fill="#0088FE"
                      name="MYTV (Normalized)"
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="unifiNorm"
                      fill="#00C49F"
                      name="Unifi (Normalized)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Head-to-Head Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center space-x-2">
                    <TvIcon className="h-5 w-5" />
                    <span>MYTV Strengths</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">Total Reach</span>
                    <span className="font-bold text-blue-900">
                      28.5M viewers
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">Market Penetration</span>
                    <span className="font-bold text-blue-900">High</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">Brand Recognition</span>
                    <span className="font-bold text-blue-900">Excellent</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-emerald-50 border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center space-x-2">
                    <WifiIcon className="h-5 w-5" />
                    <span>Unifi Strengths</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700">Content Diversity</span>
                    <span className="font-bold text-emerald-900">
                      150+ programs
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700">User Engagement</span>
                    <span className="font-bold text-emerald-900">
                      High Quality
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700">
                      Platform Innovation
                    </span>
                    <span className="font-bold text-emerald-900">Leading</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MultiplatformPage;
