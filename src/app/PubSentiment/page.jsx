"use client";

import { useState, useEffect } from "react";
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

const PubSentiment = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [allMentions, setAllMentions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [filters, setFilters] = useState({
    days: 30,
    platform: "all",
    sentiment: "all",
    topic: "all",
  });

  const fetchData = async (page = 1, resetData = true) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        days: filters.days.toString(),
        platform: filters.platform,
        sentiment: filters.sentiment,
        topic: filters.topic,
        page: page.toString(),
        limit: "10000", // Load 10k records per batch
      });

      console.log("Fetching data with filters:", { ...filters, page });
      const response = await fetch(`/api/public-mentions?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(
        `Successfully fetched ${
          result.mentions?.length || 0
        } posts/mentions for page ${page}`
      );
      console.log("API Response summary:", {
        totalMentions: result.metrics?.totalMentions,
        rawDataCount: result.mentions?.length,
        platforms: result.platforms?.length,
        topics: result.topics?.uniqueTopics?.length,
        pagination: result.meta?.pagination,
        firstFewMentions: result.mentions?.slice(0, 3).map((m) => ({
          inserttime: m.inserttime,
          type: m.type,
          sentiment: m.sentiment,
        })),
      });

      if (resetData || page === 1) {
        // First page or filter change - reset all data
        setAllMentions(result.mentions || []);
        setCurrentPage(1);
      } else {
        // Subsequent pages - append data
        setAllMentions((prev) => [...prev, ...(result.mentions || [])]);
        setCurrentPage(page);
      }

      // Update the main data with combined mentions
      const updatedResult = {
        ...result,
        mentions: resetData
          ? result.mentions
          : [...allMentions, ...(result.mentions || [])],
      };

      setData(updatedResult);
      setHasMoreData(result.meta?.pagination?.hasNextPage || false);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching public mentions data:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreData = () => {
    if (!loadingMore && hasMoreData) {
      fetchData(currentPage + 1, false);
    }
  };

  useEffect(() => {
    // Reset pagination when filters change
    setAllMentions([]);
    setCurrentPage(1);
    setHasMoreData(true);
    fetchData(1, true);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
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
          <CardHeader>
            <CardTitle className="text-red-800">Error Loading Data</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={fetchData}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
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
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
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
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {data.platforms.map((platform) => (
                  <SelectItem key={platform.platform} value={platform.platform}>
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
              <SelectContent>
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
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
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {data.topics.uniqueTopics.slice(0, 10).map((topic) => (
                  <SelectItem key={topic} value={topic}>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Mentions
            </CardTitle>
            <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.metrics.totalMentions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <EyeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.metrics.totalReach.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total audience reached
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Confidence
            </CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(data.metrics.avgConfidence * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Classification confidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Interactions
            </CardTitle>
            <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.metrics.totalInteractions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Likes, shares, comments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="sentiment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="topics">Topic Distribution</TabsTrigger>
          <TabsTrigger value="platforms">Platform Analysis</TabsTrigger>
          <TabsTrigger value="confidence">Confidence Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sentiment Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Breakdown</CardTitle>
                <CardDescription>
                  Distribution of sentiment across mentions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.sentiment.breakdown.map((item) => (
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
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Trend - Placeholder for chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Trend</CardTitle>
                <CardDescription>
                  Daily sentiment distribution over time
                </CardDescription>
              </CardHeader>
              <CardContent>
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
          <Card>
            <CardHeader>
              <CardTitle>Topic Distribution</CardTitle>
              <CardDescription>Most discussed topics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topics.distribution.slice(0, 10).map((item) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Distribution</CardTitle>
              <CardDescription>
                Mentions across different platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.platforms.map((item) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Confidence Distribution</CardTitle>
              <CardDescription>
                Classification confidence levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.confidence.distribution.map((item) => (
                  <div
                    key={item.range}
                    className="flex justify-between items-center"
                  >
                    <span className="font-medium">{item.range}</span>
                    <div className="font-semibold">
                      {item.count.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Load More Data Section */}
      {data && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-sm text-green-800">
              Data Loading Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Currently Loaded:</span>
                <span className="text-lg font-bold text-green-900">
                  {allMentions.length.toLocaleString()} /{" "}
                  {data.meta?.pagination?.total?.toLocaleString() || 0}
                </span>
              </div>

              {data.meta?.pagination && (
                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    Page {data.meta.pagination.page} of{" "}
                    {data.meta.pagination.totalPages}
                  </p>
                  <p>
                    Records per page:{" "}
                    {data.meta.pagination.limit.toLocaleString()}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (allMentions.length / data.meta.pagination.total) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-center">
                    {(
                      (allMentions.length / data.meta.pagination.total) *
                      100
                    ).toFixed(1)}
                    % loaded
                  </p>
                </div>
              )}

              {hasMoreData && (
                <button
                  onClick={loadMoreData}
                  disabled={loadingMore}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Loading more data...
                    </div>
                  ) : (
                    `Load More Data (${
                      data.meta?.pagination?.limit?.toLocaleString() || 10000
                    } more records)`
                  )}
                </button>
              )}

              {!hasMoreData && allMentions.length > 0 && (
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
        <CardHeader>
          <CardTitle className="text-sm text-blue-800">Fetch Summary</CardTitle>
        </CardHeader>
        <CardContent>
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
                Total records in database: {data.metrics?.totalMentions || 0}
              </p>
              <p>Current page: {currentPage}</p>
              <p>Has more data: {hasMoreData ? "Yes" : "No"}</p>
              <p>Date range: {filters.days} days</p>
              <p>
                Last updated: {new Date(data.meta?.queryDate).toLocaleString()}
              </p>
              <p>Unique topics: {data.topics?.uniqueTopics?.length || 0}</p>
              <p>Platforms: {data.platforms?.length || 0}</p>
              <p>
                Applied filters: Platform={filters.platform}, Sentiment=
                {filters.sentiment}, Topic={filters.topic}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PubSentiment;
