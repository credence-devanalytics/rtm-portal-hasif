"use client";
import React, { useState, useEffect, act } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Eye,
  Users,
  Globe,
  Calendar,
  Download,
  Filter,
  Hash,
  Star,
  TrendingDown,
  Smile,
  Frown,
  Meh,
  X,
  ChartAreaIcon,
} from "lucide-react";
import { Sen, Zain } from "next/font/google";
import SentimentBarChart from "@/components/SentimentBarChart";
import OverallMentionsChart from "@/components/RTMAccount/OverallMentionsChart";
import PlatformDonutChart from "@/components/RTMAccount/PlatformDonutChart";
import PopularMentionsTable from "@/components/RTMAccount/PopularMentionsTable";
import EngagementOverTimeChart from "@/components/RTMAccount/EngagementOverTimeChart";
import PlatformMentionsChart from "@/components/RTMAccount/PlatformMentionsChart";
import ClassificationMentionsChart from "@/components/RTMAccount/ClassificationMentionsChart";
import RTMUnitsPieChart from "@/components/RTMAccount/RTMUnitsPieChart";
import RTMMediaTable from "@/components/RTMAccount/RTMMediaTable";
import EngagementRateChart from "@/components/RTMAccount/EngagementRateChart";
import CalendarDatePicker from "@/components/CalendarDatePicker";
import Header from "@/components/Header";

// RTMTabs Component (unchanged)
const RTMTabs = ({ data = [], onFilterChange, activeTab, setActiveTab }) => {
  const filterByUnit = (tabId) => {
    switch (tabId) {
      case "official":
        return data.filter(
          (item) =>
            item.unit === "Official" || // Match the actual unit value
            item.unit === "Official Account" || // Keep original for safety
            item.isInfluencer === true ||
            item.followerCount > 50000
        );
      case "tv":
        return data.filter(
          (item) =>
            item.unit === "TV" ||
            item.unit?.toLowerCase().includes("tv") ||
            item.platform === "YouTube"
        );
      case "berita":
        return data.filter(
          (item) =>
            item.unit === "News" ||
            item.unit === "Berita" ||
            item.unit?.toLowerCase().includes("news") ||
            item.unit?.toLowerCase().includes("berita")
        );
      case "radio":
        return data.filter(
          (item) =>
            item.unit === "Radio" || item.unit?.toLowerCase().includes("radio")
        );
      default:
        return data;
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    onFilterChange?.(filterByUnit(tabId));
  };

  useEffect(() => {
    onFilterChange?.(filterByUnit(activeTab));
  }, [data]);

  const tabs = [
    { id: "overall", label: "RTM Overall" },
    { id: "official", label: "RTM Official Account" },
    { id: "tv", label: "TV" },
    { id: "berita", label: "Berita" },
    { id: "radio", label: "Radio" },
  ];

  return (
    <div className="w-full flex justify-center">
      <div className="w-full">
        <div className="inline-flex h-12 items-center justify-center rounded-xl bg-white p-1.5 text-slate-500 shadow-sm border border-slate-200 backdrop-blur-sm grid grid-cols-5 w-full max-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 lg:px-4 py-2.5 text-xs lg:text-sm font-medium transition-all flex-1 ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Active Filters Display Component
const ActiveFilters = ({ filters, onRemoveFilter, onClearAll }) => {
  const filterCount = Object.keys(filters).filter(
    (key) =>
      filters[key] !== null && filters[key] !== undefined && filters[key] !== ""
  ).length;

  if (filterCount === 0) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Active Filters</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {filters.sentiment && (
            <Badge variant="outline" className="flex items-center gap-1">
              Sentiment: {filters.sentiment}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onRemoveFilter("sentiment")}
              />
            </Badge>
          )}
          {filters.platform && (
            <Badge variant="outline" className="flex items-center gap-1">
              Platform: {filters.platform}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onRemoveFilter("platform")}
              />
            </Badge>
          )}
          {filters.category && (
            <Badge variant="outline" className="flex items-center gap-1">
              Category: {filters.category}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onRemoveFilter("category")}
              />
            </Badge>
          )}
          {filters.unit && (
            <Badge variant="outline" className="flex items-center gap-1">
              Unit: {filters.unit}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onRemoveFilter("unit")}
              />
            </Badge>
          )}
          {filters.author && (
            <Badge variant="outline" className="flex items-center gap-1">
              Author: {filters.author}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onRemoveFilter("author")}
              />
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const RTMDashboard = () => {
  const [activeTab, setActiveTab] = useState("overall");
  const [data, setData] = useState([]);
  const [filteredByDateAndPlatform, setFilteredByDateAndPlatform] = useState(
    []
  );
  const [finalFilteredData, setFinalFilteredData] = useState([]);
  const [mentionsOverTime, setMentionsOverTime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date('2025-01-15'), // Start from earliest data available
    to: new Date('2025-05-20'),   // End at latest data available
  });

  // NEW: Global filter state for cross-filtering
  const [globalFilters, setGlobalFilters] = useState({
    sentiment: null,
    platform: null,
    category: null,
    unit: null,
    author: null,
    // Add more filter types as needed
  });

  const handleDateRangeChange = (newDateRange) => {
    setSelectedDateRange(newDateRange);
  };

  // NEW: Global filter change handler
  const handleGlobalFilterChange = (filterType, filterValue) => {
    setGlobalFilters((prev) => ({
      ...prev,
      [filterType]: filterValue === prev[filterType] ? null : filterValue, // Toggle filter
    }));
  };

  // NEW: Remove specific filter
  const handleRemoveFilter = (filterType) => {
    setGlobalFilters((prev) => ({
      ...prev,
      [filterType]: null,
    }));
  };

  // NEW: Clear all filters
  const handleClearAllFilters = () => {
    setGlobalFilters({
      sentiment: null,
      platform: null,
      category: null,
      unit: null,
      author: null,
    });
  };

  // NEW: Apply global filters to data
  const applyGlobalFilters = (data) => {
    let filtered = [...data];

    // Apply each active filter
    if (globalFilters.sentiment) {
      filtered = filtered.filter(
        (item) => item.sentiment === globalFilters.sentiment
      );
    }
    if (globalFilters.platform) {
      filtered = filtered.filter(
        (item) => item.platform === globalFilters.platform
      );
    }
    if (globalFilters.category) {
      filtered = filtered.filter(
        (item) => item.category === globalFilters.category
      );
    }
    if (globalFilters.unit) {
      filtered = filtered.filter((item) => item.unit === globalFilters.unit);
    }
    if (globalFilters.author) {
      filtered = filtered.filter(
        (item) => item.author === globalFilters.author
      );
    }

    return filtered;
  };

  const createMentionsOverTime = (data) => {
    const groupedByDate = {};

    data.forEach((item) => {
      const date = item.date;
      if (!groupedByDate[date]) {
        groupedByDate[date] = {
          date,
          facebook: 0,
          instagram: 0,
          twitter: 0,
          tiktok: 0,
          youtube: 0,
          reddit: 0,
          linkedin: 0,
        };
      }

      const platformKey = item.platform.toLowerCase();
      if (groupedByDate[date][platformKey] !== undefined) {
        groupedByDate[date][platformKey]++;
      }
    });

    return Object.values(groupedByDate).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  // Load data from database (unchanged)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const daysDiff = Math.ceil(
          (selectedDateRange.to - selectedDateRange.from) /
            (1000 * 60 * 60 * 24)
        );

        const queryParams = new URLSearchParams({
          days: daysDiff.toString(),
          from: selectedDateRange.from.toISOString(),
          to: selectedDateRange.to.toISOString(),
          platform: selectedPlatform !== "all" ? selectedPlatform : "",
        });

        const response = await fetch(`/api/mentions?${queryParams}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data from database");
        }

        const dashboardData = await response.json();
        const dbData = dashboardData.mentions || [];

        console.log(`API returned ${dbData.length} records from database`);

        // Transform database data (unchanged transformation logic)
        const transformedData = dbData
          .map((row, index) => {
            let date = new Date();
            if (row.inserttime) {
              date = new Date(row.inserttime);
            } else if (row.insertdate) {
              date = new Date(row.insertdate);
            }

            let platform = "Other";
            if (row.type) {
              const type = row.type.toLowerCase();
              if (type.includes("facebook")) platform = "Facebook";
              else if (type.includes("instagram")) platform = "Instagram";
              else if (type.includes("twitter") || type.includes("x.com"))
                platform = "Twitter";
              else if (type.includes("tiktok")) platform = "TikTok";
              else if (type.includes("youtube")) platform = "YouTube";
              else if (type.includes("reddit")) platform = "Reddit";
              else if (type.includes("linkedin")) platform = "LinkedIn";
            }

            let unit = "Other";

            if (row.groupname) {
              const groupName = row.groupname.toLowerCase();
              if (groupName.includes("radio")) unit = "Radio";
              else if (groupName.includes("tv")) unit = "TV";
              else if (
                groupName.includes("berita") ||
                groupName.includes("news")
              )
                unit = "News";
              else if (groupName.includes("official")) unit = "Official";
            }

            if (unit === "Other" && row.from) {
              const fromField = row.from.toLowerCase();
              if (fromField.includes("radio")) unit = "Radio";
              else if (fromField.includes("tv")) unit = "TV";
              else if (
                fromField.includes("news") ||
                fromField.includes("berita")
              )
                unit = "News";
            }

            let sentiment = "neutral";
            const sentimentValue = (
              row.sentiment ||
              row.autosentiment ||
              ""
            ).toLowerCase();

            if (sentimentValue.includes("positive")) sentiment = "positive";
            else if (sentimentValue.includes("negative"))
              sentiment = "negative";
            else sentiment = "neutral";

            const likeCount = Number(
              row.likecount ||
                row.favoritecount ||
                row.diggcount ||
                row.lovecount ||
                0
            );
            const shareCount = Number(row.sharecount || row.retweetcount || 0);
            const commentCount = Number(
              row.commentcount || row.replycount || 0
            );
            const viewCount = Number(row.viewcount || row.playcount || 0);
            const totalReactions = Number(row.totalreactionscount || 0);

            const reach = Number(row.reach);
            const followerCount = Number(
              row.followerscount || row.authorfollowercount || 0
            );

            const interactions =
              likeCount + shareCount + commentCount + totalReactions;

            const influenceScore = Number(row.influencescore || row.score || 0);
            const engagementRate = Number(
              row.engagementrate || (interactions / Math.max(reach, 1)) * 100
            );

            let postUrl = row.url || "#";

            const mentionContent =
              row.fullmention ||
              row.mention ||
              row.title ||
              row.description ||
              "No content available";

            return {
              id: row.id || row.idpk || index,
              author: row.channel || `User${index}`,
              sentiment,
              category: row.topic || "General",
              date: date.toISOString().split("T")[0],
              datetime: row.inserttime || date.toISOString(),
              platform,
              unit,
              keywords: (row.keywords || "").toString(),
              likeCount,
              shareCount,
              commentCount,
              viewCount,
              totalReactions,
              interactions,
              reach,
              engagementRate,
              location: row.locations || "Malaysia",
              influenceScore,
              followerCount,
              mentionSnippet: mentionContent,
              postUrl,
              isInfluencer: followerCount > 10000 || influenceScore > 80,

              // Additional platform-specific fields (unchanged)
              facebookData: {
                pageId: row.facebookpageid,
                loveCount: Number(row.lovecount || 0),
                wowCount: Number(row.wowcount || 0),
                hahaCount: Number(row.hahacount || 0),
                sadCount: Number(row.sadcount || 0),
                angryCount: Number(row.angrycount || 0),
              },

              twitterData: {
                profileId: row.twitterprofileid,
                handle: row.twitterhandle,
                favoriteCount: Number(row.favoritecount || 0),
                retweetCount: Number(row.retweetcount || 0),
                replyCount: Number(row.replycount || 0),
                quoteCount: Number(row.quotecount || 0),
                tweetType: row.tweettype,
              },

              instagramData: {
                profileId: row.instagramprofileid,
                profileName: row.instagramprofilename,
                postId: row.instagrampostid,
                postType: row.posttype,
              },

              tiktokData: {
                id: row.tiktokid,
                diggCount: Number(row.diggcount || 0),
                playCount: Number(row.playcount || 0),
                videoDuration: Number(row.videodurationseconds || 0),
              },

              redditData: {
                subreddit: row.subreddit,
                type: row.reddittype,
                fullname: row.redditfullname,
                score: Number(row.redditscore || 0),
                commentId: row.redditcommentid,
                parentLinkId: row.redditparentlinkid,
              },

              youtubeData: {
                channelId: row.youtubechannelid,
                duration: Number(row.duration || 0),
              },

              mediaType: row.mediatype,
              image: row.image,
              photo: row.photo,
              photos: row.photos ? row.photos.split(",") : [],
              domain: row.domain,

              confidence: Number(row.confidence || 0),
              virality: Number(row.virality || 0),
              languages: row.languages,

              tokenUsage: {
                input: Number(row.inputTokens || 0),
                output: Number(row.outputTokens || 0),
                total: Number(row.totalTokens || 0),
              },

              insertDate: row.insertdate,
              downloadDate: row.downloaddate,
              databaseInsertTime: row.databaseinserttime,

              originalData: row,
            };
          })
          .filter((item) => {
            return (
              item.date &&
              !isNaN(new Date(item.date)) &&
              item.mentionSnippet &&
              item.mentionSnippet !== "No content available"
            );
          });

        console.log(
          `After data quality filtering: ${transformedData.length} records`
        );
        console.log(
          `Data quality filter removed: ${
            dbData.length - transformedData.length
          } records`
        );

        setData(transformedData);
      } catch (error) {
        console.error("Error loading database data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter data by date range and platform (first level filtering)
  useEffect(() => {
    let filtered = data;

    filtered = filtered.filter((item) => {
      const itemDate = new Date(item.date);
      const fromDate = new Date(selectedDateRange.from);
      const toDate = new Date(selectedDateRange.to);

      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);

      return itemDate >= fromDate && itemDate <= toDate;
    });

    if (selectedPlatform !== "all") {
      filtered = filtered.filter((item) => item.platform === selectedPlatform);
    }

    setFilteredByDateAndPlatform(filtered);

    const mentionsOverTimeData = createMentionsOverTime(filtered);
    setMentionsOverTime(mentionsOverTimeData);
  }, [selectedPlatform, selectedDateRange, data]);

  // NEW: Apply global filters to date/platform filtered data
  useEffect(() => {
    const globallyFiltered = applyGlobalFilters(filteredByDateAndPlatform);
    setFinalFilteredData(globallyFiltered);
  }, [filteredByDateAndPlatform, globalFilters]);

  // Handle RTM tab filtering (now works with globally filtered data)
  const handleTabFilterChange = (tabFilteredData) => {
    // Apply global filters to the tab-filtered data
    const globallyFiltered = applyGlobalFilters(tabFilteredData);
    setFinalFilteredData(globallyFiltered);
  };

  // Loading state (unchanged)
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Header />
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Loading RTM Social Media Dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate key metrics (unchanged)
  const totalMentions = finalFilteredData.length;
  const totalEngagements = finalFilteredData.reduce(
    (sum, item) => sum + item.interactions,
    0
  );
  const totalReach = finalFilteredData.reduce(
    (sum, item) => sum + item.reach,
    0
  );

  const positiveMentions = finalFilteredData.filter(
    (d) => d.sentiment === "positive"
  ).length;
  const negativeMentions = finalFilteredData.filter(
    (d) => d.sentiment === "negative"
  ).length;
  const neutralMentions = finalFilteredData.filter(
    (d) => d.sentiment === "neutral"
  ).length;

  const positiveRatio =
    totalMentions > 0 ? positiveMentions / totalMentions : 0;
  const negativeRatio =
    totalMentions > 0 ? negativeMentions / totalMentions : 0;

  let overallSentiment = "neutral";
  if (positiveRatio > 0.5) {
    overallSentiment = "positive";
  } else if (negativeRatio > 0.4) {
    overallSentiment = "negative";
  }

  const getSentimentConfig = () => {
    switch (overallSentiment) {
      case "positive":
        return {
          face: Smile,
          gradient: "from-green-50 to-emerald-100",
          border: "border-green-200",
          titleColor: "text-green-900",
          subtitleColor: "text-green-700",
          faceColor: "text-green-600",
        };
      case "negative":
        return {
          face: Frown,
          gradient: "from-red-50 to-rose-100",
          border: "border-red-200",
          titleColor: "text-red-900",
          subtitleColor: "text-red-700",
          faceColor: "text-red-600",
        };
      default:
        return {
          face: Meh,
          gradient: "from-gray-50 to-slate-100",
          border: "border-gray-200",
          titleColor: "text-gray-900",
          subtitleColor: "text-gray-700",
          faceColor: "text-gray-600",
        };
    }
  };

  const config = getSentimentConfig();
  const SentimentFace = config.face;

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  const exportData = () => {
    alert("Export functionality would be implemented here (CSV/PDF/PNG)");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header with Controls */}
      <Header />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            RTM Social Media Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring across Radio, TV, and Berita social channels
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Showing {formatNumber(totalMentions)} mentions from selected date
            range (
            {Math.ceil(
              (selectedDateRange.to - selectedDateRange.from) /
                (1000 * 60 * 60 * 24)
            )}{" "}
            days)
          </p>
        </div>

        <ActiveFilters
          filters={globalFilters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        />

        {/* Date Range and Platform Selectors (removed unit selector) */}
        <div className="flex gap-2 flex-wrap items-center">
          <CalendarDatePicker
            selectedDateRange={selectedDateRange}
            onDateRangeChange={handleDateRangeChange}
          />

          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-36">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
              <SelectItem value="TikTok">TikTok</SelectItem>
              <SelectItem value="YouTube">YouTube</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Mentions
            </CardTitle>
            <MessageSquare className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatNumber(totalMentions)}
            </div>
            <p className="text-xs mt-1">Across all platforms</p>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">
              Total Engagements
            </CardTitle>
            <ThumbsUp className="h-5 w-5 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">
              {formatNumber(totalEngagements)}
            </div>
            <p className="text-xs text-black mt-1">Likes, shares, comments</p>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Eye className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(totalReach)}</div>
            <p className="text-xs mt-1">People reached</p>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${config.titleColor}`}>
              Total Overall
            </CardTitle>
            <ChartAreaIcon className={`h-5 w-5 ${config.faceColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatNumber(totalMentions + totalEngagements + totalReach)}
            </div>
            <p className={`text-xs ${config.subtitleColor} mt-1`}>
              Mentions + Engagements + Reach
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <RTMMediaTable
          data={finalFilteredData}
          selectedTab={activeTab}
          onFilterChange={handleGlobalFilterChange}
        />
      </div>

      {/* RTM Tabs for Unit Filtering */}
      <div className="grid gap-6 lg:grid-cols-1 pb-[-10px]">
        <RTMTabs
          data={filteredByDateAndPlatform}
          onFilterChange={handleTabFilterChange}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sources Distribution - Posts */}
        <Card>
          <PlatformDonutChart
            data={finalFilteredData}
            onFilterChange={handleGlobalFilterChange}
          />
        </Card>

        {/* RTM Units Mentions Distribution */}
        <Card>
          <RTMUnitsPieChart
            data={finalFilteredData}
            onFilterChange={handleGlobalFilterChange}
          />
        </Card>
      </div>

      {/* MAIN CHARTS - Now using finalFilteredData */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Channel Posts */}
        <Card>
          <PlatformMentionsChart
            data={finalFilteredData}
            onFilterChange={handleGlobalFilterChange}
          />
        </Card>

        {/* Engagement Rate by Platform */}
        <Card>
          <EngagementRateChart
            data={finalFilteredData}
            onFilterChange={handleGlobalFilterChange}
          />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {/* Mentions Over Time by Platform */}
        <Card>
          <OverallMentionsChart
            mentionsOverTime={mentionsOverTime}
            onFilterChange={handleGlobalFilterChange}
          />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {/* Reach Over Time */}
        <Card>
          <EngagementOverTimeChart
            data={finalFilteredData}
            onFilterChange={handleGlobalFilterChange}
          />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {/* Classification Posts */}
        <Card>
          <ClassificationMentionsChart
            data={finalFilteredData}
            onFilterChange={handleGlobalFilterChange}
          />
        </Card>
      </div>

      {/* Bottom Row: Keywords and Influencers */}
      {/* <div className="grid gap-6 lg:grid-cols-1"> */}
      {/* Top Influencers */}
      {/* <Card>
          <SocialMediaWordCloud
            data={finalFilteredData}
            title="Social Media Keywords"
          />
        </Card>
      </div> */}

      <div className="grid gap-6 lg:grid-cols-1">
        {/* Top Influencers */}
        <Card>
          <PopularMentionsTable
            data={finalFilteredData}
            onFilterChange={handleGlobalFilterChange}
          />
        </Card>
      </div>
    </div>
  );
};

export default RTMDashboard;
