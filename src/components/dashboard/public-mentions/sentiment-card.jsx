import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smile, Frown, Meh } from "lucide-react";
import { cn } from "@/lib/utils";

const SentimentCard = ({ data, onFilterClick, activeFilters, isLoading }) => {
  // Get sentiment data with defaults
  const sentimentData = {
    positive: data?.positive || 0,
    negative: data?.negative || 0,
    neutral: data?.neutral || 0,
  };

  const total =
    sentimentData.positive + sentimentData.negative + sentimentData.neutral;

  // Calculate percentages
  const getPercentage = (value) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  // Check if sentiment is in active filters
  const isActive = (sentiment) => {
    return activeFilters?.sentiments?.includes(sentiment) || false;
  };

  // Handle sentiment card click for filtering
  const handleSentimentClick = (sentiment) => {
    if (onFilterClick) {
      onFilterClick("sentiment", sentiment);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                  <div className="w-20 h-4 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="text-right space-y-1">
                  <div className="w-16 h-5 bg-gray-200 animate-pulse rounded" />
                  <div className="w-10 h-3 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Sentiment Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Click on a sentiment to filter results
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Positive Sentiment */}
          <div
            className={cn(
              "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all hover:bg-green-50 border-2",
              isActive("positive")
                ? "bg-green-100 border-green-300 ring-2 ring-green-200"
                : "border-transparent hover:border-green-200"
            )}
            onClick={() => handleSentimentClick("positive")}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isActive("positive")
                    ? "bg-green-500 text-white"
                    : "bg-green-100 text-green-600"
                )}
              >
                <Smile className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-green-700">Positive</div>
                <div className="text-xs text-green-600">
                  {getPercentage(sentimentData.positive)}% of total
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-700">
                {sentimentData.positive.toLocaleString()}
              </div>
              <div className="text-xs text-green-600">mentions</div>
            </div>
          </div>

          {/* Negative Sentiment */}
          <div
            className={cn(
              "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all hover:bg-red-50 border-2",
              isActive("negative")
                ? "bg-red-100 border-red-300 ring-2 ring-red-200"
                : "border-transparent hover:border-red-200"
            )}
            onClick={() => handleSentimentClick("negative")}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isActive("negative")
                    ? "bg-red-500 text-white"
                    : "bg-red-100 text-red-600"
                )}
              >
                <Frown className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-red-700">Negative</div>
                <div className="text-xs text-red-600">
                  {getPercentage(sentimentData.negative)}% of total
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-700">
                {sentimentData.negative.toLocaleString()}
              </div>
              <div className="text-xs text-red-600">mentions</div>
            </div>
          </div>

          {/* Neutral Sentiment */}
          <div
            className={cn(
              "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50 border-2",
              isActive("neutral")
                ? "bg-gray-100 border-gray-300 ring-2 ring-gray-200"
                : "border-transparent hover:border-gray-200"
            )}
            onClick={() => handleSentimentClick("neutral")}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isActive("neutral")
                    ? "bg-gray-500 text-white"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                <Meh className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-gray-700">Neutral</div>
                <div className="text-xs text-gray-600">
                  {getPercentage(sentimentData.neutral)}% of total
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-700">
                {sentimentData.neutral.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">mentions</div>
            </div>
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Total Mentions
              </span>
              <span className="text-lg font-bold text-gray-900">
                {total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { SentimentCard };
