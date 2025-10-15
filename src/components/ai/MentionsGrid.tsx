"use client";

import { useCallback, useRef } from "react";
import { MentionCard } from "./MentionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Inbox } from "lucide-react";
import { useInfinitePublicMentions } from "@/hooks/useQueries";

interface MentionsGridProps {
  filters: {
    days: number;
    platform?: string;
    sentiment?: string;
    topic?: string;
  };
  className?: string;
}

const MENTION_CARD_SKELETON = (
  <Card className="w-full overflow-hidden">
    <Skeleton className="w-full h-48" />
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-16 h-5" />
          <Skeleton className="w-12 h-4" />
        </div>
        <Skeleton className="w-16 h-5" />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="w-24 h-4" />
      </div>
      <div className="mb-4">
        <Skeleton className="w-full h-12 mb-2" />
        <Skeleton className="w-3/4 h-4" />
      </div>
      <div className="flex items-center gap-4 mb-3">
        <Skeleton className="w-12 h-4" />
        <Skeleton className="w-12 h-4" />
        <Skeleton className="w-12 h-4" />
        <Skeleton className="w-12 h-4" />
        <Skeleton className="w-16 h-4" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <Skeleton className="w-20 h-5" />
        <Skeleton className="w-20 h-4" />
      </div>
    </CardContent>
  </Card>
);

export function MentionsGrid({ filters, className }: MentionsGridProps) {
  // Clean the filters to remove undefined values that might interfere with API calls
  const cleanFilters = {
    days: filters.days,
    platform: filters.platform && filters.platform !== 'all' ? filters.platform : undefined,
    sentiment: filters.sentiment && filters.sentiment !== 'all' ? filters.sentiment : undefined,
    topic: filters.topic && filters.topic !== 'undefined' ? filters.topic : undefined,
  };

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfinitePublicMentions(cleanFilters);

  const observerRef = useRef<IntersectionObserver>();
  const lastMentionRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasNextPage, fetchNextPage]
  );

  // Flatten all pages into a single array
  const allMentions = data?.pages.flatMap((page: any) => page.mentions || []) || [];

  if (isError) {
    return (
      <Card className="w-full p-8">
        <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Inbox className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Mentions
            </h3>
            <p className="text-gray-500 mb-4">
              We encountered an error while loading the mentions. Please try again.
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoading && allMentions.length === 0) {
    return (
      <Card className="w-full p-8">
        <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Mentions Found
            </h3>
            <p className="text-gray-500">
              No mentions match your current filters. Try adjusting your criteria.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Loading Skeletons */}
        {isLoading &&
          Array.from({ length: 6 }).map((_, index) => (
            <div key={`skeleton-${index}`}>{MENTION_CARD_SKELETON}</div>
          ))}

        {/* Mention Cards */}
        {allMentions.map((mention, index) => {
          const isLastMention = index === allMentions.length - 1;
          return (
            <div
              key={mention.id || `mention-${index}`}
              ref={isLastMention ? lastMentionRef : undefined}
            >
              <MentionCard mention={mention} />
            </div>
          );
        })}

        {/* Loading More Skeletons */}
        {isFetchingNextPage &&
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`loading-${index}`}>{MENTION_CARD_SKELETON}</div>
          ))}
      </div>

      {/* Load More Button (fallback if intersection observer doesn't work) */}
      {hasNextPage && !isFetchingNextPage && (
        <div className="flex justify-center">
          <Button
            onClick={() => fetchNextPage()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Load More
          </Button>
        </div>
      )}

      {/* End of Content Indicator */}
      {!hasNextPage && !isLoading && allMentions.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Showing {allMentions.length} mentions
          </p>
        </div>
      )}
    </div>
  );
}