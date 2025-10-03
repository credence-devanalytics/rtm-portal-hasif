/**
 * Example Dashboard Component with Caching
 * Demonstrates how to use the caching system with real charts
 */

"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  useDashboardSummary,
  useSentimentDistribution,
  usePlatformDistribution,
  useTimeSeries,
  useDashboardFilters,
  useCacheManager,
} from "@/hooks/useCachedData";

const SENTIMENT_COLORS = {
  positive: "#10B981",
  negative: "#EF4444",
  neutral: "#6B7280",
  unknown: "#94A3B8",
};

const PLATFORM_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

export default function CachedDashboard() {
  const [showCacheInfo, setShowCacheInfo] = useState(false);

  // Filter management
  const { filters, updateFilter, resetFilters, cleanFilters } =
    useDashboardFilters({
      days: "30",
      platform: "all",
      sentiment: "all",
    });

  // Cached data hooks
  const {
    data: summary,
    loading: summaryLoading,
    cacheInfo: summaryCacheInfo,
    refetch: refetchSummary,
  } = useDashboardSummary(cleanFilters);

  const {
    data: sentiment,
    loading: sentimentLoading,
    cacheInfo: sentimentCacheInfo,
  } = useSentimentDistribution(cleanFilters);

  const {
    data: platforms,
    loading: platformsLoading,
    cacheInfo: platformsCacheInfo,
  } = usePlatformDistribution(cleanFilters);

  const {
    data: timeSeries,
    loading: timeSeriesLoading,
    cacheInfo: timeSeriesCacheInfo,
  } = useTimeSeries(cleanFilters, "daily");

  // Cache management
  const { stats, health, clearCache } = useCacheManager();

  const isLoading =
    summaryLoading || sentimentLoading || platformsLoading || timeSeriesLoading;

  const handleClearCache = async () => {
    try {
      await clearCache();
      // Refetch data after clearing cache
      refetchSummary();
      alert("Cache cleared and data refreshed!");
    } catch (error) {
      alert("Failed to clear cache: " + error.message);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cached Dashboard Demo
          </h1>
          <p className="text-gray-600">
            Demonstrating high-performance caching for 40k+ row datasets
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Time Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Range
              </label>
              <select
                value={filters.days}
                onChange={(e) => updateFilter("days", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="180">Last 6 months</option>
              </select>
            </div>

            {/* Platform Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform
              </label>
              <select
                value={filters.platform}
                onChange={(e) => updateFilter("platform", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Platforms</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            {/* Sentiment Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sentiment
              </label>
              <select
                value={filters.sentiment}
                onChange={(e) => updateFilter("sentiment", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setShowCacheInfo(!showCacheInfo)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                {showCacheInfo ? "Hide" : "Show"} Cache Info
              </button>
            </div>
          </div>

          {/* Cache Management */}
          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={handleClearCache}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
            >
              Clear Cache
            </button>
            <button
              onClick={refetchSummary}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-8 mb-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        )}

        {/* Cache Performance Info */}
        {showCacheInfo && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4">Cache Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-sm">
                <div className="font-medium">Summary</div>
                <div>{summaryCacheInfo ? "Cached" : "Fresh"}</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Sentiment</div>
                <div>{sentimentCacheInfo ? "Cached" : "Fresh"}</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Platforms</div>
                <div>{platformsCacheInfo ? "Cached" : "Fresh"}</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Time Series</div>
                <div>{timeSeriesCacheInfo ? "Cached" : "Fresh"}</div>
              </div>
            </div>

            {health && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm">
                  <strong>Cache Status:</strong> {health.overall} |
                  <strong> Redis:</strong> {health.redis.status} |
                  <strong> Node Cache:</strong> {health.nodeCache.status}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Summary Cards */}
        {summary?.overview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">
                Total Mentions
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {summary.overview.totalMentions.toLocaleString()}
              </p>
              {summary.periodComparison?.mentions && (
                <p
                  className={`text-sm ${
                    summary.periodComparison.mentions.trend === "up"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {summary.periodComparison.mentions.change}% vs last period
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Reach</h3>
              <p className="text-2xl font-bold text-gray-900">
                {summary.overview.totalReach.toLocaleString()}
              </p>
              {summary.periodComparison?.reach && (
                <p
                  className={`text-sm ${
                    summary.periodComparison.reach.trend === "up"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {summary.periodComparison.reach.change}% vs last period
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">
                Engagement Rate
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {summary.overview.engagementRate}%
              </p>
              {summary.periodComparison?.engagement && (
                <p
                  className={`text-sm ${
                    summary.periodComparison.engagement.trend === "up"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {summary.periodComparison.engagement.change}% vs last period
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">
                Influencer Mentions
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {summary.overview.influencerMentions.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                {summary.overview.influencerPercentage}% of total
              </p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sentiment Donut Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              Sentiment Distribution
            </h3>
            {sentiment?.data && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sentiment.data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="sentiment"
                  >
                    {sentiment.data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          SENTIMENT_COLORS[entry.sentiment] ||
                          SENTIMENT_COLORS.unknown
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${value.toLocaleString()} (${
                        sentiment.data.find((d) => d.sentiment === name)
                          ?.percentage
                      }%)`,
                      name,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Platform Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              Platform Distribution
            </h3>
            {platforms?.data && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platforms.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="platform"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [value.toLocaleString(), "Mentions"]}
                  />
                  <Bar dataKey="count">
                    {platforms.data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PLATFORM_COLORS[index % PLATFORM_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Time Series Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Mentions Over Time</h3>
          {timeSeries?.data && (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={timeSeries.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                  formatter={(value, name) => [
                    value.toLocaleString(),
                    name === "mentions"
                      ? "Mentions"
                      : name === "reach"
                      ? "Reach"
                      : "Interactions",
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="mentions"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Mentions"
                />
                <Line
                  type="monotone"
                  dataKey="reach"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Reach"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
