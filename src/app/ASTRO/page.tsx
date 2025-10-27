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
import Image from "next/image";
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

const ASTROPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [channelSummary, setChannelSummary] = useState([]);
  const [reachOverTime, setReachOverTime] = useState([]);
  const [ratingOverTime, setRatingOverTime] = useState([]);

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
    AiFM: "#ED232A",
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
      const avgRatingValue = item.ratingCount > 0 
        ? item.rating / item.ratingCount 
        : 0;
      
      // Use 3 decimal places if rating is below 2.0, otherwise use 1 decimal place
      const avgRating = avgRatingValue < 2.0 
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-8 px-6 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">ASTRO Analytics</h1>
              <p className="text-purple-100">
                Channel Rating & Reach Performance Analysis
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleRefresh}
                variant="secondary"
                size="sm"
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Filters Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-700" />
                <CardTitle>Filters</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Channel Performance Summary
              </h2>
              <p className="text-sm text-gray-600">
                Rating and Total Reach by Channel for {filters.year}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full">
              {channelSummary.map((channel, index) => (
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
                            <Image
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

        {/* Reach Over Time Line Chart */}
        {!loading && !error && reachOverTime.length > 0 && (
          <div className="grid grid-cols-2 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span>Reach Over Time</span>
                </CardTitle>
                <CardDescription>
                  Channel reach performance trends for {filters.year}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={reachOverTime}
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
                    {/* Dynamically render lines only for channels with data */}
                    {reachOverTime.length > 0 &&
                      Object.keys(reachOverTime[0])
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
        )}

        {/* Rating Over Time Line Chart */}
        {!loading && !error && ratingOverTime.length > 0 && (
          <div className="grid grid-cols-2 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Rating Over Time</span>
                </CardTitle>
                <CardDescription>
                  Channel rating performance trends for {filters.year}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={ratingOverTime}
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
                    {/* Dynamically render lines only for channels with non-zero data */}
                    {ratingOverTime.length > 0 &&
                      Object.keys(ratingOverTime[0])
                        .filter((key) => key !== "month" && key !== "monthNum")
                        .filter((channel) => {
                          // Only show channels that have at least one non-zero value
                          return ratingOverTime.some(
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
  );
};

export default ASTROPage;
