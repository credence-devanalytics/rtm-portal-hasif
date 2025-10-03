"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  TrendingUpIcon,
  MessageSquareIcon,
  EyeIcon,
} from "lucide-react";
import Header from "@/components/Header";
import { useInfinitePublicMentions } from "@/hooks/useQueries";

const PubSentiment = () => {
  const [filters, setFilters] = useState({
    days: 30,
    platform: "all",
    sentiment: "all",
    topic: "all",
  });

  // Use TanStack Query for data fetching
  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    status,
    fetchStatus,
  } = useInfinitePublicMentions(filters);

  // Debug logging
  console.log("🔍 TanStack Query Debug:", {
    filters,
    status,
    fetchStatus,
    isLoading,
    hasData: !!data,
    pagesCount: data?.pages?.length || 0,
    error: error?.message,
    queryKey: ["publicMentions", filters],
  });

  // Flatten all pages data
  const allMentions = data?.pages?.flatMap((page) => page.mentions) || [];
  const firstPageData = data?.pages?.[0];

  const handleFilterChange = (key, value) => {
    console.log(`Filter changed: ${key} = ${value}`);
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [key]: value,
      };
      console.log("New filters:", newFilters);
      return newFilters;
    });
  };

  const loadMoreData = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Header />
        <div className="pt-20 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading public sentiment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="">
            <CardTitle className="text-red-800">Error Loading Data</CardTitle>
            <CardDescription className="text-red-600">
              {error.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!firstPageData) {
    return (
      <div className="container mx-auto p-6">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Header />
      {/* Header */}
      <div className="pt-10 flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Public Sentiment Analysis</h1>
          <p className="text-gray-600">
            Analyze public mentions and sentiment trends across platforms
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <Select
              value={filters.days.toString()}
              onValueChange={(value) =>
                handleFilterChange("days", parseInt(value))
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent className="">
                <SelectItem className="" value="7">
                  Last 7 days
                </SelectItem>
                <SelectItem className="" value="30">
                  Last 30 days
                </SelectItem>
                <SelectItem className="" value="90">
                  Last 90 days
                </SelectItem>
                <SelectItem className="" value="365">
                  Last year
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Platform:</span>
            <Select
              value={filters.platform}
              onValueChange={(value) => handleFilterChange("platform", value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All platforms" />
              </SelectTrigger>
              <SelectContent className="">
                <SelectItem className="" value="all">
                  All Platforms
                </SelectItem>
                {firstPageData?.platforms?.map((platform) => (
                  <SelectItem
                    className=""
                    key={platform.platform}
                    value={platform.platform}
                  >
                    {platform.platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Sentiment:</span>
            <Select
              value={filters.sentiment}
              onValueChange={(value) => handleFilterChange("sentiment", value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="All sentiment" />
              </SelectTrigger>
              <SelectContent className="">
                <SelectItem className="" value="all">
                  All Sentiment
                </SelectItem>
                <SelectItem className="" value="positive">
                  Positive
                </SelectItem>
                <SelectItem className="" value="negative">
                  Negative
                </SelectItem>
                <SelectItem className="" value="neutral">
                  Neutral
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Topic:</span>
            <Select
              value={filters.topic}
              onValueChange={(value) => handleFilterChange("topic", value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All topics" />
              </SelectTrigger>
              <SelectContent className="">
                <SelectItem className="" value="all">
                  All Topics
                </SelectItem>
                {firstPageData?.topics?.uniqueTopics
                  ?.slice(0, 10)
                  .map((topic) => (
                    <SelectItem className="" key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Mentions
            </CardTitle>
            <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="">
            <div className="text-2xl font-bold">
              {firstPageData?.metrics?.totalMentions?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all platforms
            </p>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <EyeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="">
            <div className="text-2xl font-bold">
              {firstPageData?.metrics?.totalReach?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total audience reached
            </p>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Confidence
            </CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="">
            <div className="text-2xl font-bold">
              {((firstPageData?.metrics?.avgConfidence || 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Classification confidence
            </p>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Interactions
            </CardTitle>
            <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="">
            <div className="text-2xl font-bold">
              {firstPageData?.metrics?.totalInteractions?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Likes, shares, comments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="sentiment" className="space-y-4">
        <TabsList className="">
          <TabsTrigger className="" value="sentiment">
            Sentiment Analysis
          </TabsTrigger>
          <TabsTrigger className="" value="topics">
            Topic Distribution
          </TabsTrigger>
          <TabsTrigger className="" value="platforms">
            Platform Analysis
          </TabsTrigger>
          <TabsTrigger className="" value="confidence">
            Confidence Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sentiment Breakdown */}
            <Card className="">
              <CardHeader className="">
                <CardTitle className="">Sentiment Breakdown</CardTitle>
                <CardDescription className="">
                  Distribution of sentiment across mentions
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                <div className="space-y-3">
                  {firstPageData?.sentiment?.breakdown?.map((item) => (
                    <div
                      key={item.sentiment}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            item.sentiment === "positive"
                              ? "bg-green-500"
                              : item.sentiment === "negative"
                              ? "bg-red-500"
                              : "bg-gray-500"
                          }`}
                        ></div>
                        <span className="capitalize">
                          {item.sentiment || "Unknown"}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {item.count.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(item.avgConfidence * 100).toFixed(1)}% conf.
                        </div>
                      </div>
                    </div>
                  )) || <p>No sentiment data available</p>}
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Trend - Placeholder for chart */}
            <Card className="">
              <CardHeader className="">
                <CardTitle className="">Sentiment Trend</CardTitle>
                <CardDescription className="">
                  Daily sentiment distribution over time
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500">
                    Chart component will be added here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <Card className="">
            <CardHeader className="">
              <CardTitle className="">Topic Distribution</CardTitle>
              <CardDescription className="">
                Most discussed topics
              </CardDescription>
            </CardHeader>
            <CardContent className="">
              <div className="space-y-3">
                {firstPageData?.topics?.distribution
                  ?.slice(0, 10)
                  .map((item) => (
                    <div
                      key={item.topic}
                      className="flex justify-between items-center"
                    >
                      <span className="font-medium">
                        {item.topic || "Unknown"}
                      </span>
                      <div className="text-right">
                        <div className="font-semibold">
                          {item.count.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(item.avgConfidence * 100).toFixed(1)}% conf.
                        </div>
                      </div>
                    </div>
                  )) || <p>No topic data available</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <Card className="">
            <CardHeader className="">
              <CardTitle className="">Platform Distribution</CardTitle>
              <CardDescription className="">
                Mentions across different platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="">
              <div className="space-y-3">
                {firstPageData?.platforms?.map((item) => (
                  <div
                    key={item.platform}
                    className="flex justify-between items-center"
                  >
                    <span className="font-medium">{item.platform}</span>
                    <div className="text-right">
                      <div className="font-semibold">
                        {item.count.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.totalReach.toLocaleString()} reach
                      </div>
                    </div>
                  </div>
                )) || <p>No platform data available</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confidence" className="space-y-4">
          <Card className="">
            <CardHeader className="">
              <CardTitle className="">Confidence Distribution</CardTitle>
              <CardDescription className="">
                Classification confidence levels
              </CardDescription>
            </CardHeader>
            <CardContent className="">
              <div className="space-y-3">
                {firstPageData?.confidence?.distribution?.map((item) => (
                  <div
                    key={item.range}
                    className="flex justify-between items-center"
                  >
                    <span className="font-medium">{item.range}</span>
                    <div className="font-semibold">
                      {item.count.toLocaleString()}
                    </div>
                  </div>
                )) || <p>No confidence data available</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Load More Data Section */}
      {firstPageData && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="">
            <CardTitle className="text-sm text-green-800">
              Data Loading Status
            </CardTitle>
          </CardHeader>
          <CardContent className="">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Currently Loaded:</span>
                <span className="text-lg font-bold text-green-900">
                  {allMentions.length.toLocaleString()} /{" "}
                  {firstPageData?.meta?.pagination?.total?.toLocaleString() ||
                    0}
                </span>
              </div>

              {firstPageData?.meta?.pagination && (
                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    Total pages available:{" "}
                    {firstPageData.meta.pagination.totalPages}
                  </p>
                  <p>
                    Records per page:{" "}
                    {firstPageData.meta.pagination.limit.toLocaleString()}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (allMentions.length /
                            firstPageData.meta.pagination.total) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-center">
                    {(
                      (allMentions.length /
                        firstPageData.meta.pagination.total) *
                      100
                    ).toFixed(1)}
                    % loaded
                  </p>
                </div>
              )}

              {hasNextPage && (
                <button
                  onClick={loadMoreData}
                  disabled={isFetchingNextPage}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isFetchingNextPage ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Loading more data...
                    </div>
                  ) : (
                    `Load More Data (${
                      firstPageData?.meta?.pagination?.limit?.toLocaleString() ||
                      10000
                    } more records)`
                  )}
                </button>
              )}

              {!hasNextPage && allMentions.length > 0 && (
                <div className="text-center text-green-700 font-medium">
                  ✅ All data loaded ({allMentions.length.toLocaleString()}{" "}
                  records)
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug info (remove in production) */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="">
          <CardTitle className="text-sm text-blue-800">Fetch Summary</CardTitle>
        </CardHeader>
        <CardContent className="">
          <div className="text-sm space-y-2">
            <div className="flex justify-between items-center p-2 bg-blue-100 rounded">
              <span className="font-semibold text-blue-900">
                Posts Currently Displayed:
              </span>
              <span className="text-lg font-bold text-blue-900">
                {allMentions.length || 0}
              </span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                Total records in database:{" "}
                {firstPageData?.metrics?.totalMentions || 0}
              </p>
              <p>Has more data: {hasNextPage ? "Yes" : "No"}</p>
              <p>Date range: {filters.days} days</p>
              <p>
                Last updated:{" "}
                {firstPageData?.meta?.queryDate
                  ? new Date(firstPageData.meta.queryDate).toLocaleString()
                  : "N/A"}
              </p>
              <p>
                Unique topics:{" "}
                {firstPageData?.topics?.uniqueTopics?.length || 0}
              </p>
              <p>Platforms: {firstPageData?.platforms?.length || 0}</p>
              <p>
                Applied filters: Platform={filters.platform}, Sentiment=
                {filters.sentiment}, Topic={filters.topic}
              </p>
              <p>TanStack Query Status: {isLoading ? "Loading" : "Loaded"}</p>
              <p>Query Status: {status}</p>
              <p>Fetch Status: {fetchStatus}</p>
              <p>Is Fetching Next Page: {isFetchingNextPage ? "Yes" : "No"}</p>
              <p>Has Next Page: {hasNextPage ? "Yes" : "No"}</p>
              <p>Query Key: {JSON.stringify(["publicMentions", filters])}</p>
              <p>Current Filters: {JSON.stringify(filters)}</p>
              <p>Data Pages: {data?.pages?.length || 0}</p>
              <p>Error: {error ? error.message : "None"}</p>
              <p>
                Cache Status:{" "}
                {(data as any)?._cache?.hit ? "Cache Hit" : "Fresh Data"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PubSentiment;
