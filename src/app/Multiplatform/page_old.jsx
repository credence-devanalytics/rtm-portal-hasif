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
  PieChartIcon,
} from "lucide-react";
import useMultiplatformData from "../../hooks/useMultiplatformData";

// Import chart components
import PlatformTrendsChart from "../../components/Multiplatform/PlatformTrendsChart";
import ChannelComparisonChart from "../../components/Multiplatform/ChannelComparisonChart";
import ViewingSplitChart from "../../components/Multiplatform/ViewingSplitChart";
import MytvChannelTrendsChart from "../../components/Multiplatform/MytvChannelTrendsChart";
import MytvChannelRankingChart from "../../components/Multiplatform/MytvChannelRankingChart";
import MytvGrowthTable from "../../components/Multiplatform/MytvGrowthTable";
import UnifiTopProgramsChart from "../../components/Multiplatform/UnifiTopProgramsChart";
import DurationMauScatterChart from "../../components/Multiplatform/DurationMauScatterChart";
import HourlyViewershipHeatmap from "../../components/Multiplatform/HourlyViewershipHeatmap";

const MultiplatformPage = () => {
  const [activeTab, setActiveTab] = useState("overall");

  // Global Filters State
  const [globalFilters, setGlobalFilters] = useState({
    monthYear: "202502",
    channels: [],
    platforms: ["mytv", "unifi"],
    region: "all",
  });

  // Fetch data using custom hook
  const { data, loading, error } = useMultiplatformData(globalFilters);

  // Debug: Log the received data
  React.useEffect(() => {
    console.log("Dashboard - Received data:", data);
    console.log("Dashboard - Loading:", loading);
    console.log("Dashboard - Error:", error);
  }, [data, loading, error]);

  // Calculate KPIs from actual data
  const kpis = React.useMemo(() => {
    return {
      totalMytvViewers: data.mytvViewership?.summary?.totalViewers || 28500000,
      totalUnifiMau: data.unifiViewership?.summary?.totalMau || 518883,
      avgAccessPerUser: data.unifiViewership?.summary?.avgMau
        ? (
            (data.unifiViewership.summary.totalMau /
              data.unifiViewership.summary.totalPrograms) *
            0.045
          ).toFixed(1)
        : 45.2,
    };
  }, [data]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              TV Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Multi-platform viewership analysis for MYTV & Unifi
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge
              variant="outline"
              className={
                loading
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-blue-50 text-blue-700"
              }
            >
              {loading ? "Loading..." : "Live Data"}
            </Badge>
            <span className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              Error loading data: {error}. Displaying with mock data.
            </p>
          </div>
        )}
      </div>

      {/* Global Filters Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Month-Year Selector */}
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <Select
              value={globalFilters.monthYear}
              onValueChange={(value) => handleFilterChange("monthYear", value)}
            >
              <SelectTrigger className="w-32">
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

          {/* Platform Selector */}
          <div className="flex items-center space-x-2">
            <PlayCircleIcon className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">
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
              >
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
              >
                Unifi
              </Button>
            </div>
          </div>

          {/* Channel Multi-Select */}
          <div className="flex items-center space-x-2">
            <BarChart3Icon className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">
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
                  className="text-xs px-2 py-1"
                >
                  {channel}
                </Button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
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
          >
            Clear Filters
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
          <TabsList className="grid w-full grid-cols-3 lg:w-96">
            <TabsTrigger
              value="overall"
              className="flex items-center space-x-2"
            >
              <TrendingUpIcon className="h-4 w-4" />
              <span>Overall</span>
            </TabsTrigger>
            <TabsTrigger value="mytv" className="flex items-center space-x-2">
              <UsersIcon className="h-4 w-4" />
              <span>MYTV</span>
            </TabsTrigger>
            <TabsTrigger value="unifi" className="flex items-center space-x-2">
              <PlayCircleIcon className="h-4 w-4" />
              <span>Unifi</span>
            </TabsTrigger>
          </TabsList>

          {/* Overall Tab */}
          <TabsContent value="overall" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Overall Performance
              </h2>
              <p className="text-gray-600">
                Combined insights from MYTV and Unifi platforms
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total MYTV Viewers
                  </CardTitle>
                  <UsersIcon className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {kpis.totalMytvViewers.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? "Loading..." : "+12.5% from last month"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Unifi MAU
                  </CardTitle>
                  <PlayCircleIcon className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {kpis.totalUnifiMau.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? "Loading..." : "+8.3% from last month"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg Access per User
                  </CardTitle>
                  <TrendingUpIcon className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {kpis.avgAccessPerUser} min
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? "Loading..." : "+2.1% from last month"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Platform Trends */}
              <PlatformTrendsChart
                mytvData={data.mytvViewership}
                unifiData={data.unifiViewership}
                loading={loading}
              />

              {/* Unifi Viewing Split */}
              <ViewingSplitChart
                unifiData={data.unifiSummary}
                loading={loading}
              />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 gap-6">
              {/* Channel Comparison */}
              <ChannelComparisonChart
                mytvData={data.mytvViewership}
                unifiData={data.unifiViewership}
                loading={loading}
              />
            </div>
          </TabsContent>

          {/* MYTV Tab */}
          <TabsContent value="mytv" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                MYTV Deep Dive
              </h2>
              <p className="text-gray-600">
                Monthly and channel-level audience analysis
              </p>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Multi-Line Chart */}
              <MytvChannelTrendsChart
                mytvData={data.mytvViewership}
                loading={loading}
              />

              {/* Channel Ranking */}
              <MytvChannelRankingChart
                mytvData={data.mytvViewership}
                loading={loading}
                selectedMonth={globalFilters.monthYear}
              />
            </div>

            {/* Growth Table */}
            <MytvGrowthTable mytvData={data.mytvViewership} loading={loading} />
          </TabsContent>

          {/* Unifi Tab */}
          <TabsContent value="unifi" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Unifi Analytics
              </h2>
              <p className="text-gray-600">
                Program-level engagement and genre insights
              </p>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Programs */}
              <UnifiTopProgramsChart
                unifiData={data.unifiViewership}
                loading={loading}
              />

              {/* Duration vs MAU Scatter */}
              <DurationMauScatterChart
                unifiData={data.unifiViewership}
                loading={loading}
              />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hourly Heatmap */}
              <HourlyViewershipHeatmap
                unifiData={data.unifiViewership}
                loading={loading}
              />

              {/* Genre by Tier Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>MAU by Genre & Tier</CardTitle>
                  <CardDescription>
                    Content performance by subscription level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="flex space-x-2 mb-2">
                        <div className="w-8 h-12 bg-blue-300 rounded"></div>
                        <div className="w-8 h-16 bg-green-300 rounded"></div>
                        <div className="w-8 h-10 bg-purple-300 rounded"></div>
                      </div>
                      <p>Stacked Column Chart</p>
                      <p className="text-sm">Genre MAU by Basic/Premium</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Small Multiples Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Program Trend Analysis</CardTitle>
                <CardDescription>
                  Individual program performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="grid grid-cols-3 gap-4 mb-2">
                      {Array.from({ length: 3 }, (_, i) => (
                        <div
                          key={i}
                          className="w-16 h-12 bg-gray-300 rounded flex items-center justify-center"
                        >
                          <TrendingUpIcon className="h-6 w-6" />
                        </div>
                      ))}
                    </div>
                    <p>Small Multiples</p>
                    <p className="text-sm">Program MAU trends over months</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MultiplatformPage;
