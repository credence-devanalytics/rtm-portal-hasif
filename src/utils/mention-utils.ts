import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format numbers with commas and abbreviations
export function formatNumber(num: number): string {
  if (!num || num === 0) return "0";

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }

  return num.toLocaleString();
}

// Format engagement rate
export function formatEngagementRate(rate: number): string {
  if (!rate || rate === 0) return "0%";
  return `${rate.toFixed(1)}%`;
}

// Format date and time
export function formatDateTime(dateString: string): { date: string; time: string; relative: string } {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return { date: "N/A", time: "N/A", relative: "N/A" };
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    let relative = "";
    if (diffHours < 1) {
      relative = "Just now";
    } else if (diffHours < 24) {
      relative = `${diffHours}h ago`;
    } else if (diffDays < 7) {
      relative = `${diffDays}d ago`;
    } else {
      relative = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
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
      relative,
    };
  } catch (error) {
    return { date: "N/A", time: "N/A", relative: "N/A" };
  }
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number = 200): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Platform configuration
export const PLATFORM_CONFIG = {
  facebook: {
    name: "Facebook",
    icon: "📘",
    color: "#1877F2",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  instagram: {
    name: "Instagram",
    icon: "📷",
    color: "#E4405F",
    bgColor: "bg-pink-50",
    textColor: "text-pink-700",
    borderColor: "border-pink-200",
  },
  twitter: {
    name: "Twitter",
    icon: "🐦",
    color: "#1DA1F2",
    bgColor: "bg-sky-50",
    textColor: "text-sky-700",
    borderColor: "border-sky-200",
  },
  tiktok: {
    name: "TikTok",
    icon: "🎵",
    color: "#000000",
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
  },
  youtube: {
    name: "YouTube",
    icon: "📺",
    color: "#FF0000",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
  linkedin: {
    name: "LinkedIn",
    icon: "💼",
    color: "#0A66C2",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  reddit: {
    name: "Reddit",
    icon: "🤖",
    color: "#FF4500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
  },
  default: {
    name: "Unknown",
    icon: "🌐",
    color: "#6B7280",
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
  },
};

// Get platform configuration
export function getPlatformConfig(platform?: string): typeof PLATFORM_CONFIG.default {
  if (!platform) return PLATFORM_CONFIG.default;

  const normalizedPlatform = platform.toLowerCase();

  // Check for exact matches first
  for (const [key, config] of Object.entries(PLATFORM_CONFIG)) {
    if (key === normalizedPlatform) {
      return config;
    }
  }

  // Check for partial matches
  if (normalizedPlatform.includes("facebook")) return PLATFORM_CONFIG.facebook;
  if (normalizedPlatform.includes("instagram")) return PLATFORM_CONFIG.instagram;
  if (normalizedPlatform.includes("twitter") || normalizedPlatform.includes("x.com")) return PLATFORM_CONFIG.twitter;
  if (normalizedPlatform.includes("tiktok")) return PLATFORM_CONFIG.tiktok;
  if (normalizedPlatform.includes("youtube")) return PLATFORM_CONFIG.youtube;
  if (normalizedPlatform.includes("linkedin")) return PLATFORM_CONFIG.linkedin;
  if (normalizedPlatform.includes("reddit")) return PLATFORM_CONFIG.reddit;

  return PLATFORM_CONFIG.default;
}

// Sentiment configuration
export const SENTIMENT_CONFIG = {
  positive: {
    name: "Positive",
    icon: "😊",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    borderColor: "border-green-200",
  },
  negative: {
    name: "Negative",
    icon: "😔",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    borderColor: "border-red-200",
  },
  neutral: {
    name: "Neutral",
    icon: "😐",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    borderColor: "border-gray-200",
  },
  default: {
    name: "Unknown",
    icon: "❓",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    borderColor: "border-gray-200",
  },
};

// Get sentiment configuration
export function getSentimentConfig(sentiment?: string): typeof SENTIMENT_CONFIG.default {
  if (!sentiment) return SENTIMENT_CONFIG.default;

  const normalizedSentiment = sentiment.toLowerCase();

  if (normalizedSentiment.includes("positiv")) return SENTIMENT_CONFIG.positive;
  if (normalizedSentiment.includes("negativ")) return SENTIMENT_CONFIG.negative;
  if (normalizedSentiment.includes("neutral")) return SENTIMENT_CONFIG.neutral;

  return SENTIMENT_CONFIG.default;
}

// Calculate total interactions
export function calculateTotalInteractions(likeCount: number = 0, shareCount: number = 0, commentCount: number = 0): number {
  return (likeCount || 0) + (shareCount || 0) + (commentCount || 0);
}

// Generate topic badge colors
export function getTopicBadgeColor(topic: string): string {
  if (!topic) return "bg-gray-100 text-gray-800 border-gray-200";

  const colors = [
    "bg-blue-100 text-blue-800 border-blue-200",
    "bg-green-100 text-green-800 border-green-200",
    "bg-purple-100 text-purple-800 border-purple-200",
    "bg-orange-100 text-orange-800 border-orange-200",
    "bg-teal-100 text-teal-800 border-teal-200",
    "bg-pink-100 text-pink-800 border-pink-200",
    "bg-indigo-100 text-indigo-800 border-indigo-200",
    "bg-yellow-100 text-yellow-800 border-yellow-200",
    "bg-cyan-100 text-cyan-800 border-cyan-200",
    "bg-emerald-100 text-emerald-800 border-emerald-200",
  ];

  // Simple hash function for consistent color assignment
  let hash = 0;
  for (let i = 0; i < topic.length; i++) {
    hash = topic.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

// Validate and sanitize URL
export function sanitizeUrl(url?: string): string | undefined {
  if (!url) return undefined;

  try {
    const sanitized = new URL(url);
    // Only allow http and https protocols
    if (sanitized.protocol === "http:" || sanitized.protocol === "https:") {
      return sanitized.toString();
    }
  } catch (error) {
    // Invalid URL
    return undefined;
  }

  return undefined;
}