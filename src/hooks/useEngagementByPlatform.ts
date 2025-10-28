import { useQuery } from "@tanstack/react-query";

interface EngagementFilters {
  from: string;
  to: string;
  platform?: string;
  type?: string;
  author?: string;
}

interface EngagementPlatformData {
  platform: string;
  engagement_rate_pct: number;
  total_interactions: number;
  total_reach: number;
  mentions_count: number;
}

interface EngagementByPlatformResponse {
  success: boolean;
  data: EngagementPlatformData[];
  metadata: {
    total_platforms: number;
    query_time_ms: number;
    total_time_ms: number;
    filters: {
      startDate?: string;
      endDate?: string;
      platform?: string;
      type?: string;
      author?: string;
    };
  };
}

const fetchEngagementByPlatform = async (
  filters: EngagementFilters
): Promise<EngagementByPlatformResponse> => {
  const queryParams = new URLSearchParams({
    startDate: filters.from || "",
    endDate: filters.to || "",
    platform: filters.platform || "",
    type: filters.type || "",
    author: filters.author || "",
  });

  console.log(
    "🔄 Fetching Engagement by Platform with filters:",
    Object.fromEntries(queryParams)
  );
  console.log(
    "🌐 API URL:",
    `/api/rtm-account/engagement-by-platform?${queryParams}`
  );

  const fetchStartTime = Date.now();
  const response = await fetch(
    `/api/rtm-account/engagement-by-platform?${queryParams}`
  );
  console.log(`⏱️ Fetch took ${Date.now() - fetchStartTime}ms`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Response not OK:", response.status, errorText);
    throw new Error(
      `Engagement by platform API request failed: ${response.statusText}`
    );
  }

  const result = await response.json();
  console.log("✅ Engagement by Platform received:", result);
  console.log("📊 Platforms count:", result.data?.length);
  console.log("📊 Query time:", result.metadata?.query_time_ms, "ms");

  return result;
};

export const useEngagementByPlatform = (filters: EngagementFilters) => {
  const queryKey = ["engagement-by-platform", filters];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchEngagementByPlatform(filters),
    staleTime: 2 * 60 * 1000, // Data stays fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Retry failed requests once
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });

  return {
    data: data ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
