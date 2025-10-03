"use client";

import { useState } from "react";
import {
  useMentions,
  useSentimentDistribution,
  usePlatformDistribution,
  useTimeSeries,
  useTopMentions,
  useCacheStats,
} from "@/hooks/useQueries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DashboardExample = () => {
  const [filters] = useState({
    days: 30,
    platform: "all",
    sentiment: "all",
  });

  // All these queries run CONCURRENTLY when the component mounts
  const mentionsQuery = useMentions(filters);
  const sentimentQuery = useSentimentDistribution(filters);
  const platformQuery = usePlatformDistribution(filters);
  const timeSeriesQuery = useTimeSeries(filters);
  const topMentionsQuery = useTopMentions(filters);
  const cacheQuery = useCacheStats();

  // Check if any query is loading
  const isLoading = [
    mentionsQuery.isLoading,
    sentimentQuery.isLoading,
    platformQuery.isLoading,
    timeSeriesQuery.isLoading,
    topMentionsQuery.isLoading,
    cacheQuery.isLoading,
  ].some(Boolean);

  // Check if any query has error
  const hasError = [
    mentionsQuery.error,
    sentimentQuery.error,
    platformQuery.error,
    timeSeriesQuery.error,
    topMentionsQuery.error,
    cacheQuery.error,
  ].some(Boolean);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading dashboard data concurrently...
          </p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="">
            <CardTitle className="text-red-800">
              Error Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="">
            <p className="text-red-600">Some components failed to load data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Concurrent Dashboard Example</h1>

      {/* Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card
          className={
            mentionsQuery.isLoading ? "border-yellow-300" : "border-green-300"
          }
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Mentions Query</CardTitle>
          </CardHeader>
          <CardContent className="">
            <div
              className={`text-xs ${
                mentionsQuery.isLoading ? "text-yellow-600" : "text-green-600"
              }`}
            >
              {mentionsQuery.isLoading ? "Loading..." : "✅ Loaded"}
            </div>
          </CardContent>
        </Card>

        <Card
          className={
            sentimentQuery.isLoading ? "border-yellow-300" : "border-green-300"
          }
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sentiment Query</CardTitle>
          </CardHeader>
          <CardContent className="">
            <div
              className={`text-xs ${
                sentimentQuery.isLoading ? "text-yellow-600" : "text-green-600"
              }`}
            >
              {sentimentQuery.isLoading ? "Loading..." : "✅ Loaded"}
            </div>
          </CardContent>
        </Card>

        <Card
          className={
            platformQuery.isLoading ? "border-yellow-300" : "border-green-300"
          }
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Platform Query</CardTitle>
          </CardHeader>
          <CardContent className="">
            <div
              className={`text-xs ${
                platformQuery.isLoading ? "text-yellow-600" : "text-green-600"
              }`}
            >
              {platformQuery.isLoading ? "Loading..." : "✅ Loaded"}
            </div>
          </CardContent>
        </Card>

        <Card
          className={
            timeSeriesQuery.isLoading ? "border-yellow-300" : "border-green-300"
          }
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Time Series Query</CardTitle>
          </CardHeader>
          <CardContent className="">
            <div
              className={`text-xs ${
                timeSeriesQuery.isLoading ? "text-yellow-600" : "text-green-600"
              }`}
            >
              {timeSeriesQuery.isLoading ? "Loading..." : "✅ Loaded"}
            </div>
          </CardContent>
        </Card>

        <Card
          className={
            topMentionsQuery.isLoading
              ? "border-yellow-300"
              : "border-green-300"
          }
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Mentions Query</CardTitle>
          </CardHeader>
          <CardContent className="">
            <div
              className={`text-xs ${
                topMentionsQuery.isLoading
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {topMentionsQuery.isLoading ? "Loading..." : "✅ Loaded"}
            </div>
          </CardContent>
        </Card>

        <Card
          className={
            cacheQuery.isLoading ? "border-yellow-300" : "border-green-300"
          }
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cache Query</CardTitle>
          </CardHeader>
          <CardContent className="">
            <div
              className={`text-xs ${
                cacheQuery.isLoading ? "text-yellow-600" : "text-green-600"
              }`}
            >
              {cacheQuery.isLoading ? "Loading..." : "✅ Loaded"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Only show when data is available */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mentions Summary */}
        {mentionsQuery.data && (
          <Card className="">
            <CardHeader className="">
              <CardTitle className="">Mentions Overview</CardTitle>
            </CardHeader>
            <CardContent className="">
              <div className="text-2xl font-bold">
                {mentionsQuery.data.metrics?.totalMentions?.toLocaleString() ||
                  0}
              </div>
              <p className="text-sm text-gray-600">Total mentions found</p>
            </CardContent>
          </Card>
        )}

        {/* Sentiment Summary */}
        {sentimentQuery.data && (
          <Card className="">
            <CardHeader className="">
              <CardTitle className="">Sentiment Distribution</CardTitle>
            </CardHeader>
            <CardContent className="">
              <div className="space-y-2">
                {sentimentQuery.data.sentiments?.map((item) => (
                  <div key={item.sentiment} className="flex justify-between">
                    <span className="capitalize">{item.sentiment}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Platform Summary */}
        {platformQuery.data && (
          <Card className="">
            <CardHeader className="">
              <CardTitle className="">Platform Distribution</CardTitle>
            </CardHeader>
            <CardContent className="">
              <div className="space-y-2">
                {platformQuery.data.platforms?.map((item) => (
                  <div key={item.platform} className="flex justify-between">
                    <span>{item.platform}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cache Status */}
        {cacheQuery.data && (
          <Card className="">
            <CardHeader className="">
              <CardTitle className="">Cache Status</CardTitle>
            </CardHeader>
            <CardContent className="">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Redis Status</span>
                  <span className="font-semibold">
                    {cacheQuery.data.data?.redis?.status || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Overall</span>
                  <span className="font-semibold">
                    {cacheQuery.data.data?.overall || "Unknown"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Debug Information */}
      <Card className="bg-blue-50">
        <CardHeader className="">
          <CardTitle className="text-blue-800">
            TanStack Query Debug Info
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <div className="text-sm space-y-2">
            <h4 className="font-semibold">Query Status:</h4>
            <ul className="space-y-1 text-xs">
              <li>
                • Mentions:{" "}
                {mentionsQuery.isLoading
                  ? "Loading"
                  : mentionsQuery.data
                  ? "Success"
                  : "No Data"}
              </li>
              <li>
                • Sentiment:{" "}
                {sentimentQuery.isLoading
                  ? "Loading"
                  : sentimentQuery.data
                  ? "Success"
                  : "No Data"}
              </li>
              <li>
                • Platform:{" "}
                {platformQuery.isLoading
                  ? "Loading"
                  : platformQuery.data
                  ? "Success"
                  : "No Data"}
              </li>
              <li>
                • Time Series:{" "}
                {timeSeriesQuery.isLoading
                  ? "Loading"
                  : timeSeriesQuery.data
                  ? "Success"
                  : "No Data"}
              </li>
              <li>
                • Top Mentions:{" "}
                {topMentionsQuery.isLoading
                  ? "Loading"
                  : topMentionsQuery.data
                  ? "Success"
                  : "No Data"}
              </li>
              <li>
                • Cache:{" "}
                {cacheQuery.isLoading
                  ? "Loading"
                  : cacheQuery.data
                  ? "Success"
                  : "No Data"}
              </li>
            </ul>
            <p className="mt-2 text-green-600 font-semibold">
              🚀 All queries above are running CONCURRENTLY for optimal
              performance!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardExample;
