"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUpIcon, LoaderIcon } from "lucide-react";
import { Response } from "@/components/ai-elements/response";
import type { SocialMediaMessage } from "../../app/(ai)/api/chat/social-media/route";

interface LatestTopicProps {
  message: SocialMediaMessage;
  part: any;
}

export function LatestTopic({ message, part }: LatestTopicProps) {
  const { data } = part;

  if (data.status === "searching") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUpIcon className="size-5 text-muted-foreground" />
            Latest Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-muted-foreground">
            <LoaderIcon className="size-4 animate-spin" />
            <span>Searching for trending topics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.status === "found" && data.topicSummary) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUpIcon className="size-5 text-muted-foreground" />
              Latest Trending Topics
            </CardTitle>
            <Badge variant="secondary" className="gap-1">
              <TrendingUpIcon className="size-3" />
              Trending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:text-sm [&_p]:leading-relaxed">
              <Response>{data.topicSummary}</Response>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
              <TrendingUpIcon className="size-3" />
              <span>AI-generated summary</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}