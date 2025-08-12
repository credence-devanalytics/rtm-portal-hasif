"use client";
import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Sen } from "next/font/google";
import SentimentBarChart from "@/components/SentimentBarChart";
import OverallMentionsChart from "@/components/OverallMentionsChart";
import PlatformDonutChart from "@/components/PlatformDonutChart";
import PopularMentionsTable from "@/components/PopularMentionsTable";
import EngagementOverTimeChart from "@/components/EngagementOverTimeChart";
import PlatformMentionsChart from "@/components/PlatformMentionsChart";
import ClassificationMentionsChart from "@/components/ClassificationMentionsChart";
import RTMUnitsPieChart from "@/components/RTMUnitsPieChart";
import CalendarDatePicker from "@/components/CalendarDatePicker";
import Header from "@/components/Header";

// RTMTabs Component
const RTMTabs = ({ data = [], onFilterChange }) => {
  const [activeTab, setActiveTab] = useState("overall");

  const filterByUnit = (tabId) => {
    switch (tabId) {
      case "official":
        return data.filter(
          (item) =>
            item.unit === "Official Account" ||
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

  // Apply initial filter when data changes
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
        <div className="inline-flex h-12 items-center justify-center rounded-xl bg-white p-1.5 text-slate-500 shadow-md border border-slate-200 backdrop-blur-sm grid grid-cols-5 w-full max-w-full">
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

const RTMDashboard = () => {
  const [data, setData] = useState([]);
  const [filteredByDateAndPlatform, setFilteredByDateAndPlatform] = useState(
    []
  );
  const [finalFilteredData, setFinalFilteredData] = useState([]);
  const [mentionsOverTime, setMentionsOverTime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: last 30 days
    to: new Date(),
  });

  const handleDateRangeChange = (newDateRange) => {
    setSelectedDateRange(newDateRange);
  };
  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Calculate days between selected dates
        const daysDiff = Math.ceil(
          (selectedDateRange.to - selectedDateRange.from) /
            (1000 * 60 * 60 * 24)
        );

        // Build query parameters
        const queryParams = new URLSearchParams({
          days: daysDiff.toString(),
          platform: selectedPlatform !== "all" ? selectedPlatform : "",
          limit: "1000",
        });

        // Fetch data from database API endpoint
        const response = await fetch(`/api/mentions?${queryParams}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data from database");
        }

        const dashboardData = await response.json();
        const dbData = dashboardData.mentions || [];

        // Transform database data to match component structure
        const transformedData = dbData
          .map((row, index) => {
            // Parse date from inserttime or insertdate
            let date = new Date();
            if (row.inserttime) {
              date = new Date(row.inserttime);
            } else if (row.insertdate) {
              date = new Date(row.insertdate);
            }

            // Determine platform from type field
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

            // Determine unit from groupname, from, or author (instead of channel)
            let unit = "Other";

            // First check groupname
            if (row.groupname) {
              const groupName = row.groupname.toLowerCase();
              if (groupName.includes("radio")) unit = "Radio";
              else if (groupName.includes("tv")) unit = "TV";
              else if (
                groupName.includes("berita") ||
                groupName.includes("news")
              )
                unit = "News";
              else if (groupName.includes("blog")) unit = "Blog";
              else if (groupName.includes("forum")) unit = "Forum";
            }

            // If no unit found from groupname, check 'from' field
            if (unit === "Other" && row.from) {
              const fromField = row.from.toLowerCase();
              if (fromField.includes("radio")) unit = "Radio";
              else if (fromField.includes("tv")) unit = "TV";
              else if (
                fromField.includes("news") ||
                fromField.includes("berita")
              )
                unit = "News";
              else if (fromField.includes("blog")) unit = "Blog";
              else if (fromField.includes("forum")) unit = "Forum";
              else if (fromField.includes("youtube")) unit = "YouTube";
              else if (fromField.includes("facebook")) unit = "Social Media";
              else if (fromField.includes("instagram")) unit = "Social Media";
              else if (
                fromField.includes("twitter") ||
                fromField.includes("x.com")
              )
                unit = "Social Media";
              else if (fromField.includes("tiktok")) unit = "Social Media";
              else if (fromField.includes("reddit")) unit = "Forum";
              else if (fromField.includes("linkedin")) unit = "Professional";
            }

            // If still no unit found, check 'author' field as final fallback
            if (unit === "Other" && row.author) {
              const authorField = row.author.toLowerCase();
              if (authorField.includes("radio")) unit = "Radio";
              else if (authorField.includes("tv")) unit = "TV";
              else if (
                authorField.includes("news") ||
                authorField.includes("berita")
              )
                unit = "News";
              else if (authorField.includes("blog")) unit = "Blog";
              else if (authorField.includes("forum")) unit = "Forum";
              else if (authorField.includes("youtube")) unit = "YouTube";
              else if (authorField.includes("facebook")) unit = "Social Media";
              else if (authorField.includes("instagram")) unit = "Social Media";
              else if (
                authorField.includes("twitter") ||
                authorField.includes("x.com")
              )
                unit = "Social Media";
              else if (authorField.includes("tiktok")) unit = "Social Media";
              else if (authorField.includes("reddit")) unit = "Forum";
              else if (authorField.includes("linkedin")) unit = "Professional";
            }

            // Parse sentiment - use the new sentiment field first, fallback to autosentiment
            let sentiment = "neutral"; // Default to neutral
            const sentimentValue = (
              row.sentiment ||
              row.autosentiment ||
              ""
            ).toLowerCase();

            if (sentimentValue.includes("positive")) sentiment = "positive";
            else if (sentimentValue.includes("negative"))
              sentiment = "negative";
            else sentiment = "neutral";

            console.log(
              "Parsed sentiment:",
              sentiment,
              "from:",
              row.sentiment || row.autosentiment
            );

            // Parse engagement metrics with new field names
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

            // Calculate reach - use sourcereach first, then reach, then viewcount, or default
            const reach = Number(row.reach);

            // Get follower count
            const followerCount = Number(
              row.followerscount || row.authorfollowercount || 0
            );

            // Calculate total interactions
            const interactions =
              likeCount + shareCount + commentCount + totalReactions;

            // Parse influence score and other metrics
            const influenceScore = Number(row.influencescore || row.score || 0);
            const engagementRate = Number(
              row.engagementrate || (interactions / Math.max(reach, 1)) * 100
            );

            // Extract post URL based on platform
            let postUrl = row.url || "#";

            // Get mention content
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

              // Additional platform-specific fields
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

              // Media and content
              mediaType: row.mediatype,
              image: row.image,
              photo: row.photo,
              photos: row.photos ? row.photos.split(",") : [],
              domain: row.domain,

              // AI/ML fields
              confidence: Number(row.confidence || 0),
              virality: Number(row.virality || 0),
              languages: row.languages,

              // Token usage (if using AI processing)
              tokenUsage: {
                input: Number(row.inputTokens || 0),
                output: Number(row.outputTokens || 0),
                total: Number(row.totalTokens || 0),
              },

              // Metadata
              insertDate: row.insertdate,
              downloadDate: row.downloaddate,
              databaseInsertTime: row.databaseinserttime,

              // Keep original data for debugging
              originalData: row,
            };
          })
          .filter((item) => {
            // Filter out invalid dates and ensure required fields
            return (
              item.date &&
              !isNaN(new Date(item.date)) &&
              item.mentionSnippet &&
              item.mentionSnippet !== "No content available"
            );
          });

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

        const mentionsOverTimeData = createMentionsOverTime(transformedData);

        setData(transformedData);
        setMentionsOverTime(mentionsOverTimeData);
      } catch (error) {
        console.error("Error loading database data:", error);
        // Fallback to empty data or show error message
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

    // Date range filter
    filtered = filtered.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate >= selectedDateRange.from && itemDate <= selectedDateRange.to
      );
    });

    // Platform filter
    if (selectedPlatform !== "all") {
      filtered = filtered.filter((item) => item.platform === selectedPlatform);
    }

    setFilteredByDateAndPlatform(filtered);
  }, [selectedPlatform, selectedDateRange, data]);

  // Handle final filtering from RTMTabs
  const handleTabFilterChange = (tabFilteredData) => {
    setFinalFilteredData(tabFilteredData);
  };

  // Loading state
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

  // Calculate key metrics using final filtered data
  const totalMentions = finalFilteredData.length;
  const totalEngagements = finalFilteredData.reduce(
    (sum, item) => sum + item.interactions,
    0
  );
  const totalReach = finalFilteredData.reduce(
    (sum, item) => sum + item.reach,
    0
  );

  // Sentiment counts
  const positiveMentions = finalFilteredData.filter(
    (d) => d.sentiment === "positive"
  ).length;
  const negativeMentions = finalFilteredData.filter(
    (d) => d.sentiment === "negative"
  ).length;
  const neutralMentions = finalFilteredData.filter(
    (d) => d.sentiment === "neutral"
  ).length;

  // Calculate overall sentiment for the card styling
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

  // Get sentiment config for card styling
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

  // Platform distribution
  const platformDistribution = finalFilteredData.reduce((acc, item) => {
    acc[item.platform] = (acc[item.platform] || 0) + 1;
    return acc;
  }, {});

  // Top performing content
  const topContent = [...finalFilteredData]
    .sort((a, b) => b.reach - a.reach)
    .slice(0, 10);

  // Utility functions
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  const getPlatformColor = (platform) => {
    const colors = {
      facebook: "#1877F2",
      instagram: "#E4405F",
      twitter: "#1DA1F2",
      tiktok: "#000000",
    };
    return colors[platform] || "#6B7280";
  };

  const exportData = () => {
    // Mock export functionality
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
        </div>

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
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
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
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Total Mentions
            </CardTitle>
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {formatNumber(totalMentions)}
            </div>
            <p className="text-xs text-blue-700 mt-1">Across all platforms</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">
              Total Engagements
            </CardTitle>
            <ThumbsUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {formatNumber(totalEngagements)}
            </div>
            <p className="text-xs text-green-700 mt-1">
              Likes, shares, comments
            </p>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-r ${config.gradient} ${config.border}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${config.titleColor}`}>
              Sentiment Score
            </CardTitle>
            <SentimentFace className={`h-5 w-5 ${config.faceColor}`} />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Smile className="h-3 w-3 text-green-600" />
                <span className="text-green-600 font-bold">
                  +{positiveMentions}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Frown className="h-3 w-3 text-red-600" />
                <span className="text-red-600 font-bold">
                  -{negativeMentions}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Meh className="h-3 w-3 text-gray-600" />
                <span className="text-gray-600 font-bold">
                  ~{neutralMentions}
                </span>
              </div>
            </div>
            <p className={`text-xs ${config.subtitleColor} mt-1`}>
              Positive vs Negative vs Neutral
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">
              Total Reach
            </CardTitle>
            <Eye className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              {formatNumber(totalReach)}
            </div>
            <p className="text-xs text-orange-700 mt-1">People reached</p>
          </CardContent>
        </Card>
      </div>

      {/* RTM Tabs for Unit Filtering */}
      <div className="grid gap-6 lg:grid-cols-1 pb-[-10px]">
        <RTMTabs
          data={filteredByDateAndPlatform}
          onFilterChange={handleTabFilterChange}
        />
      </div>

      {/* MAIN CHARTS - Now using finalFilteredData */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mentions Over Time by Platform */}
        <Card>
          <PlatformDonutChart data={finalFilteredData} />
        </Card>

        {/* Sentiment Trend */}
        <Card>
          <SentimentBarChart data={finalFilteredData} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {/* Mentions Over Time by Platform */}
        <Card>
          <OverallMentionsChart mentionsOverTime={mentionsOverTime} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {/* Top Influencers */}
        <Card>
          <EngagementOverTimeChart data={finalFilteredData} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Platforms */}
        <Card>
          <PlatformMentionsChart data={finalFilteredData} />
        </Card>
        <Card>
          <RTMUnitsPieChart data={finalFilteredData} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {/* Top Platforms */}
        <Card>
          <ClassificationMentionsChart data={finalFilteredData} />
        </Card>
      </div>

      {/* Bottom Row: Keywords and Influencers */}
      <div className="grid gap-6 lg:grid-cols-1">
        {/* Top Influencers */}
        <Card>
          <PopularMentionsTable data={finalFilteredData} />
        </Card>
      </div>
    </div>
  );
};

export default RTMDashboard;
