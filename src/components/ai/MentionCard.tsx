"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  Heart,
  MessageCircle,
  Share,
  TrendingUp,
  User,
  Clock,
  ExternalLink,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import {
  formatNumber,
  formatEngagementRate,
  formatDateTime,
  truncateText,
  getPlatformConfig,
  getSentimentConfig,
  calculateTotalInteractions,
  getTopicBadgeColor,
  sanitizeUrl,
  cn,
} from "@/utils/mention-utils";

interface MentionCardProps {
  mention: {
    id: string;
    mention: string;
    author?: string;
    inserttime: string;
    photo?: string;
    originalphoto?: string;
    image?: string;
    reach?: number;
    likecount?: number;
    sharecount?: number;
    commentcount?: number;
    interaction?: number;
    engagementrate?: number;
    type?: string;
    sentiment?: string;
    topic?: string;
    url?: string;
  };
  className?: string;
}

export function MentionCard({ mention, className }: MentionCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isImageError, setIsImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate derived values
  const platformConfig = getPlatformConfig(mention.type);
  const sentimentConfig = getSentimentConfig(mention.sentiment);
  const { date, time, relative } = formatDateTime(mention.inserttime);
  const totalInteractions = calculateTotalInteractions(
    mention.likecount,
    mention.sharecount,
    mention.commentcount
  );

  // Handle text truncation
  const shouldTruncate = mention.mention && mention.mention.length > 200;
  const displayText = shouldTruncate && !isExpanded
    ? truncateText(mention.mention, 200)
    : mention.mention;

  // Get the best available photo
  const photoUrl = mention.photo || mention.originalphoto || mention.image;
  const hasPhoto = photoUrl && !isImageError;

  // Handle image load events
  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setIsImageError(true);
  };

  const sanitizedUrl = sanitizeUrl(mention.url);

  return (
    <Card className={cn("w-full overflow-hidden hover:shadow-lg transition-shadow duration-200", className)}>
      {/* Photo Section - Only render if photo exists */}
      {hasPhoto && (
        <div className="relative w-full h-48 overflow-hidden">
          {isImageLoading && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <img
            src={photoUrl}
            alt="Mention media"
            className={cn(
              "w-full h-48 object-cover transition-opacity duration-200",
              isImageLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      )}

      <CardContent className="p-4">
        {/* Header Row - Platform, Time, Sentiment */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1 text-xs",
                platformConfig.bgColor,
                platformConfig.textColor,
                platformConfig.borderColor
              )}
            >
              <span>{platformConfig.icon}</span>
              <span className="font-medium">{platformConfig.name}</span>
            </Badge>

            <span className="text-gray-400 text-xs">•</span>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{relative}</span>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1 text-xs",
              sentimentConfig.bgColor,
              sentimentConfig.textColor,
              sentimentConfig.borderColor
            )}
          >
            <span>{sentimentConfig.icon}</span>
            <span className="font-medium">{sentimentConfig.name}</span>
          </Badge>
        </div>

        {/* Author */}
        {mention.author && (
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="w-6 h-6">
              <AvatarImage src={undefined} />
              <AvatarFallback className="text-xs">
                {mention.author.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm text-gray-900">
              {mention.author}
            </span>
          </div>
        )}

        {/* Mention Text */}
        {mention.mention && (
          <div className="mb-4">
            <p className="text-sm text-gray-800 leading-relaxed">
              {displayText}
            </p>
            {shouldTruncate && (
              <Button
                variant="link"
                className="p-0 h-auto text-xs text-blue-600 hover:text-blue-800"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Show Less" : "Read More"}
              </Button>
            )}
          </div>
        )}

        {/* Engagement Metrics */}
        <div className="flex items-center gap-4 mb-3 text-xs">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-blue-500" />
            <span className="font-medium">{formatNumber(mention.reach || 0)}</span>
            <span className="text-gray-500">reach</span>
          </div>

          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-500" />
            <span className="font-medium">{formatNumber(mention.likecount || 0)}</span>
            <span className="text-gray-500">likes</span>
          </div>

          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3 text-blue-500" />
            <span className="font-medium">{formatNumber(mention.commentcount || 0)}</span>
            <span className="text-gray-500">comments</span>
          </div>

          <div className="flex items-center gap-1">
            <Share className="w-3 h-3 text-green-500" />
            <span className="font-medium">{formatNumber(mention.sharecount || 0)}</span>
            <span className="text-gray-500">shares</span>
          </div>

          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-purple-500" />
            <span className="font-medium">{formatEngagementRate(mention.engagementrate || 0)}</span>
            <span className="text-gray-500">engagement</span>
          </div>
        </div>

        {/* Footer Row - Topic and URL */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Tag className="w-3 h-3 text-indigo-500" />
            {mention.topic && (
              <Badge
                variant="outline"
                className={cn("text-xs", getTopicBadgeColor(mention.topic))}
              >
                {mention.topic}
              </Badge>
            )}
          </div>

          {sanitizedUrl && (
            <a
              href={sanitizedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View Original
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}