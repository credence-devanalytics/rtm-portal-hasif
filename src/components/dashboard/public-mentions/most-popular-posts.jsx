import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  ChevronDown,
  ChevronUp,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";
import { format, parseISO } from "date-fns";

const MostPopularPosts = ({
  data,
  onPostClick,
  activeFilters,
  isLoading,
  onSortChange,
  currentSort = "reach",
}) => {
  const [showAll, setShowAll] = useState(false);

  // Debug logging with useEffect to track updates
  React.useEffect(() => {
    console.log("🎯 MostPopularPosts data updated:", {
      data: data,
      dataType: Array.isArray(data) ? "array" : typeof data,
      dataLength: data?.length,
      isLoading: isLoading,
      currentSort: currentSort,
    });

    if (data && Array.isArray(data) && data.length > 0) {
      console.log("🎯 First post raw data:", data[0]);
    }
  }, [data, isLoading, currentSort]);

  // Handle sort change - trigger new database query
  const handleSortChange = (newSort) => {
    if (onSortChange) {
      console.log("🔄 Triggering new database query with sort:", newSort);
      onSortChange(newSort);
    }
  };

  // Handle the data structure - data should be the posts array directly
  const postsArray = Array.isArray(data) ? data : [];

  if (postsArray.length > 0) {
    console.log("🎯 Processing posts array with length:", postsArray.length);
    console.log("🎯 First post for processing:", {
      reach: postsArray[0]?.reach,
      likecount: postsArray[0]?.likecount,
      sharecount: postsArray[0]?.sharecount,
      commentcount: postsArray[0]?.commentcount,
    });
  }

  // Get platform icon
  const getPlatformIcon = (platform) => {
    const iconClass = "h-4 w-4";
    switch (platform?.toLowerCase()) {
      case "facebook":
        return <Facebook className={iconClass} />;
      case "twitter":
        return <Twitter className={iconClass} />;
      case "instagram":
        return <Instagram className={iconClass} />;
      case "linkedin":
        return <Linkedin className={iconClass} />;
      case "youtube":
        return <Youtube className={iconClass} />;
      default:
        return <Eye className={iconClass} />;
    }
  };

  // Get sentiment color
  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      case "neutral":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Prepare posts data (no client-side sorting - data comes pre-sorted from API)
  const processedData = React.useMemo(() => {
    if (!postsArray || postsArray.length === 0) return [];

    return postsArray.map((post) => {
      // Ensure numeric values are properly converted
      const reach = parseInt(post.reach) || 0;
      const likecount = parseInt(post.likecount) || 0;
      const sharecount = parseInt(post.sharecount) || 0;
      const commentcount = parseInt(post.commentcount) || 0;

      console.log("Post data:", {
        id: post.id,
        reach,
        likecount,
        sharecount,
        commentcount,
        originalReach: post.reach,
        originalLikes: post.likecount,
      });

      return {
        ...post,
        reach,
        likecount,
        sharecount,
        commentcount,
        totalInteractions: likecount + sharecount + commentcount,
        formattedDate: post.inserttime
          ? format(parseISO(post.inserttime), "MMM dd, yyyy")
          : "Unknown",
        shortContent:
          post.content || post.mention || post.title || "No content available",
      };
    });
  }, [postsArray]); // Removed sortBy dependency since sorting is now done by API

  const displayedPosts = showAll ? processedData : processedData.slice(0, 5);

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num?.toLocaleString() || "0";
  };

  // Truncate text
  const truncateText = (text, maxLength = 120) => {
    if (!text) return "No content available";
    return text.length <= maxLength
      ? text
      : text.substring(0, maxLength) + "...";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Most Popular Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex gap-4 p-4 border border-gray-200 rounded-lg"
              >
                <div className="w-12 h-12 bg-gray-200 animate-pulse rounded" />
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="w-1/2 h-3 bg-gray-200 animate-pulse rounded" />
                  <div className="flex gap-4">
                    <div className="w-16 h-3 bg-gray-200 animate-pulse rounded" />
                    <div className="w-16 h-3 bg-gray-200 animate-pulse rounded" />
                    <div className="w-16 h-3 bg-gray-200 animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (processedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Most Popular Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No popular posts available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Most Popular Posts</CardTitle>
            <p className="text-sm text-muted-foreground">
              Top performing social media mentions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={currentSort === "reach" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange("reach")}
            >
              By Reach
            </Button>
            <Button
              variant={currentSort === "interactions" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange("interactions")}
            >
              By Engagement
            </Button>
            <Button
              variant={currentSort === "date" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange("date")}
            >
              By Date
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedPosts.map((post, index) => (
            <div
              key={post.id || index}
              className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onPostClick && onPostClick(post)}
            >
              {/* Platform Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {getPlatformIcon(post.type)}
                </div>
              </div>

              {/* Post Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-900">
                      {post.author || "Unknown Author"}
                    </span>
                    <Badge
                      variant="outline"
                      className={getSentimentColor(
                        post.sentiment || post.autosentiment
                      )}
                    >
                      {post.sentiment || post.autosentiment || "neutral"}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {post.formattedDate}
                    </span>
                  </div>
                  {post.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(post.url, "_blank");
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Content */}
                <p className="text-sm text-gray-700 mb-3">
                  {truncateText(post.shortContent)}
                </p>

                {/* Metrics */}
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{formatNumber(post.reach || 0)} reach</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{formatNumber(post.likecount || 0)} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="h-3 w-3" />
                    <span>{formatNumber(post.sharecount || 0)} shares</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{formatNumber(post.commentcount || 0)} comments</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {processedData.length > 5 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="gap-2"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show {processedData.length - 5} More Posts
                </>
              )}
            </Button>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {processedData.length}
              </div>
              <div className="text-xs text-gray-600">Total Posts</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {formatNumber(
                  processedData.reduce(
                    (sum, post) => sum + (post.reach || 0),
                    0
                  )
                )}
              </div>
              <div className="text-xs text-gray-600">Total Reach</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {formatNumber(
                  processedData.reduce(
                    (sum, post) => sum + post.totalInteractions,
                    0
                  )
                )}
              </div>
              <div className="text-xs text-gray-600">Total Engagement</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {processedData.length > 0
                  ? formatNumber(
                      Math.round(
                        processedData.reduce(
                          (sum, post) => sum + post.totalInteractions,
                          0
                        ) / processedData.length
                      )
                    )
                  : 0}
              </div>
              <div className="text-xs text-gray-600">Avg Engagement</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { MostPopularPosts };
