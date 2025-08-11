import React from "react";
import {
  ExternalLink,
  User,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";

const PopularMentionsTable = ({ data }) => {
  // Sort by reach (highest first) and take top 10
  const topMentions = [...data]
    .sort((a, b) => (b.reach || 0) - (a.reach || 0))
    .slice(0, 10);

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

  // Sentiment badge styles
  const getSentimentStyle = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      case "neutral":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Format numbers with commas
  const formatNumber = (num) => {
    if (!num) return "0";
    return num.toLocaleString();
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
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
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left p-4 font-semibold text-gray-700">
                Post
              </th>
              <th className="text-left p-4 font-semibold text-gray-700">
                Author & Platform
              </th>
              <th className="text-left p-4 font-semibold text-gray-700">
                Date & Time
              </th>
              <th className="text-left p-4 font-semibold text-gray-700">
                Reach
              </th>
              <th className="text-left p-4 font-semibold text-gray-700">
                Interactions
              </th>
              <th className="text-left p-4 font-semibold text-gray-700">
                Sentiment
              </th>
            </tr>
          </thead>
          <tbody>
            {topMentions.map((mention, index) => {
              const platformStyle = platformStyles[mention.platform] || {
                color: "#6B7280",
                bg: "bg-gray-50",
              };
              const { date, time } = formatDateTime(mention.date);

              return (
                <tr
                  key={mention.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* Post Column */}
                  <td className="p-4 max-w-xs">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {truncateText(mention.mentionSnippet)}
                      </p>
                      <a
                        href={mention.postUrl}
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
                          {mention.author}
                        </span>
                        {mention.isInfluencer && (
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full font-medium">
                            Influencer
                          </span>
                        )}
                      </div>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${platformStyle.bg}`}
                      >
                        <div
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: platformStyle.color }}
                        ></div>
                        <span style={{ color: platformStyle.color }}>
                          {mention.platform}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Date & Time Column */}
                  <td className="p-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{date}</div>
                        <div className="text-xs text-gray-500">{time}</div>
                      </div>
                    </div>
                  </td>

                  {/* Reach Column */}
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-lg text-gray-800">
                        {formatNumber(mention.reach)}
                      </span>
                    </div>
                  </td>

                  {/* Interactions Column */}
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-800">
                          {formatNumber(mention.interactions)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>
                          ❤️ {formatNumber(mention.likeCount)} • 🔄{" "}
                          {formatNumber(mention.shareCount)}
                        </div>
                        <div>💬 {formatNumber(mention.commentCount)}</div>
                      </div>
                    </div>
                  </td>

                  {/* Sentiment Column */}
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getSentimentStyle(
                        mention.sentiment
                      )}`}
                    >
                      {mention.sentiment
                        ? mention.sentiment.charAt(0).toUpperCase() +
                          mention.sentiment.slice(1)
                        : "Unknown"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
