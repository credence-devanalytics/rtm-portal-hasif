import React, { useState, useEffect, useMemo } from "react";
import {
  ExternalLink,
  User,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Fetch search results
const fetchSearchResults = async (searchQuery: string, filters: any) => {
  if (!searchQuery || searchQuery.trim().length === 0) {
    return { results: [], meta: {} };
  }

  const params = new URLSearchParams();
  params.append("q", searchQuery);
  
  if (filters.platform) params.append("platform", filters.platform);
  if (filters.channel) params.append("channel", filters.channel);
  if (filters.unit) params.append("unit", filters.unit);

  const response = await fetch(`/api/rtm-mentions-search?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch search results");
  }

  return response.json();
};

const PopularMentionsTable = ({
  data = [],
  onFilterChange = null,
  activeFilters = {} as any,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms debounce

  // Fetch search results using TanStack Query
  const {
    data: searchData,
    isLoading: isSearching,
    error: searchError,
  } = useQuery({
    queryKey: ["mentions-search", debouncedSearchQuery, activeFilters],
    queryFn: () => fetchSearchResults(debouncedSearchQuery, activeFilters),
    enabled: debouncedSearchQuery.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Determine which data to display
  const displayData = useMemo(() => {
    if (debouncedSearchQuery.trim().length > 0 && searchData?.results) {
      return searchData.results;
    }
    return data;
  }, [debouncedSearchQuery, searchData, data]);

  // Simple deduplication based on id only, with fallback
  const topMentions = React.useMemo(() => {
    if (!Array.isArray(displayData) || displayData.length === 0) return [];

    // Remove duplicates based on id
    const uniqueData = displayData.filter(
      (item, index, self) =>
        item && index === self.findIndex((t) => t?.id === item?.id)
    );

    return uniqueData
      .sort((a, b) => (b?.reach || 0) - (a?.reach || 0))
      .slice(0, debouncedSearchQuery.trim().length > 0 ? 50 : 10);
  }, [displayData, debouncedSearchQuery]);

  // Handle row click - disabled cross-filtering
  // const handleRowClick = (mention: any) => {
  //   if (onFilterChange && mention) {
  //     // Filter by channel/author
  //     if (mention.channel) {
  //       // Toggle filter - if already filtered by this channel, clear it
  //       if (activeFilters.channel === mention.channel) {
  //         onFilterChange("channel", null);
  //       } else {
  //         onFilterChange("channel", mention.channel);
  //       }
  //     }
  //   }
  // };

  // Platform colors and icons
  const platformStyles = {
    Facebook: { color: "#1877F2", bg: "bg-blue-50" },
    Instagram: { color: "#E4405F", bg: "bg-pink-50" },
    Twitter: { color: "#1DA1F2", bg: "bg-sky-50" },
    TikTok: { color: "#000000", bg: "bg-gray-50" },
    YouTube: { color: "#FF0000", bg: "bg-red-50" },
    LinkedIn: { color: "#0A66C2", bg: "bg-blue-50" },
    Reddit: { color: "#FF4500", bg: "bg-orange-50" },
  };

  // Category badge styles
  const getCategoryStyle = (category) => {
    if (!category) return "bg-gray-100 text-gray-800 border-gray-200";

    // Generate consistent colors based on category name
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-orange-100 text-orange-800 border-orange-200",
      "bg-teal-100 text-teal-800 border-teal-200",
      "bg-pink-100 text-pink-800 border-pink-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
      "bg-yellow-100 text-yellow-800 border-yellow-200",
    ];

    // Simple hash function to consistently assign colors
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  // Format numbers with commas
  const formatNumber = (num) => {
    if (!num) return "0";
    return num.toLocaleString();
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return { date: "N/A", time: "N/A" };
      }
      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch (error) {
      return { date: "N/A", time: "N/A" };
    }
  };

  // Truncate text for display
  const truncateText = (text, maxLength = 100) => {
    if (!text) return "No content available";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Generate mock post URL (replace with actual URL field if available)
  const getPostUrl = (mention) => {
    const platform = mention.platform?.toLowerCase();
    const postId = mention.postUrl;

    // Mock URLs - replace with actual URL logic based on your data
    return mention.postUrl;
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Most Popular Mentions
        </h2>
        <p className="text-gray-600">
          Most impactful mentions ranked by their reach
        </p>
        {onFilterChange && activeFilters.channel && (
          <div className="mt-3">
            <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Filtered by channel: {activeFilters.channel}
            </span>
          </div>
        )}

        {/* Search Input */}
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mentions (last 30 days)..."
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {searchQuery && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {isSearching ? (
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                ) : (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Search Info */}
          {debouncedSearchQuery.trim().length > 0 && (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {searchError ? (
                  <span className="text-red-600">Error loading search results</span>
                ) : isSearching ? (
                  <span>Searching...</span>
                ) : (
                  <span>
                    Found <strong>{topMentions.length}</strong> result{topMentions.length !== 1 ? 's' : ''} 
                    {searchData?.meta?.dateRange && (
                      <span className="ml-1 text-gray-500">
                        (from {new Date(searchData.meta.dateRange.from).toLocaleDateString()} to {new Date(searchData.meta.dateRange.to).toLocaleDateString()})
                      </span>
                    )}
                  </span>
                )}
              </p>
              {!isSearching && topMentions.length > 0 && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {topMentions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {debouncedSearchQuery.trim().length > 0 
              ? "No mentions found matching your search criteria" 
              : "No mentions data available"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">{/* Table will be inserted here */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left p-4 font-semibold text-gray-700">
                Post
              </th>
              <th className="text-left p-4 font-semibold text-gray-700">
                Account & Platform
              </th>
              <th className="text-center p-4 font-semibold text-gray-700">
                Date
              </th>
              <th className="text-center p-4 font-semibold text-gray-700">
                Reach
              </th>
              <th className="text-center p-4 font-semibold text-gray-700">
                Interactions
              </th>
              <th className="text-center p-4 font-semibold text-gray-700">
                Category
              </th>
            </tr>
          </thead>
          <tbody>
            {topMentions.map((mention, index) => {
              const platformStyle = platformStyles[mention.platform] || {
                color: "#6B7280",
                bg: "bg-gray-50",
              };
              const { date, time } = formatDateTime(
                mention.insertdate || mention.datetime || mention.date
              );

              return (
                <tr
                  key={`mention-${index}-${mention?.id || Math.random()}`}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* Post Column */}
                  <td className="p-4 max-w-xs">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {truncateText(
                          mention?.mention ||
                            mention?.mentionSnippet ||
                            mention?.title
                        )}
                      </p>
                      <a
                        href={mention?.url || mention?.postUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Post <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </td>

                  {/* Author & Platform Column */}
                  <td className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-800">
                          {mention?.author || "Unknown"}
                        </span>
                      </div>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${platformStyle.bg}`}
                      >
                        <div
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: platformStyle.color }}
                        ></div>
                        <span style={{ color: platformStyle.color }}>
                          {mention?.platform || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Date Column */}
                  <td className="p-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{date}</div>
                      </div>
                    </div>
                  </td>

                  {/* Reach Column */}
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-lg text-gray-800">
                        {formatNumber(mention?.reach)}
                      </span>
                    </div>
                  </td>

                  {/* Interactions Column */}
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Image
                          src="/icon/social-engagement.png"
                          alt="Social Engagement"
                          width={16}
                          height={16}
                          className="opacity-60"
                        />
                        <span className="font-semibold text-gray-800">
                          {formatNumber(mention?.interactions)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        ❤️{" "}
                        {formatNumber(
                          mention?.likecount || mention?.likeCount || 0
                        )}{" "}
                        • 🔄{" "}
                        {formatNumber(
                          mention?.sharecount || mention?.shareCount || 0
                        )}{" "}
                        • 💬{" "}
                        {formatNumber(
                          mention?.commentcount || mention?.commentCount || 0
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category Column */}
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryStyle(
                        mention?.topic || mention?.category
                      )}`}
                    >
                      {mention?.topic || mention?.category || "Unknown"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}

      {/* Summary Footer */}
      {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {formatNumber(
                topMentions.reduce((sum, m) => sum + (m.reach || 0), 0)
              )}
            </p>
            <p className="text-sm text-gray-600">Total Reach</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {formatNumber(
                topMentions.reduce((sum, m) => sum + (m.interactions || 0), 0)
              )}
            </p>
            <p className="text-sm text-gray-600">Total Interactions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {topMentions.length}
            </p>
            <p className="text-sm text-gray-600">Top Mentions</p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default PopularMentionsTable;
