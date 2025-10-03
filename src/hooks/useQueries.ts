import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

// Query keys factory for better organization
export const queryKeys = {
  mentions: ['mentions'],
  publicMentions: (filters) => ['publicMentions', filters],
  dashboardSummary: (filters) => ['dashboardSummary', filters],
  sentimentDistribution: (filters) => ['sentimentDistribution', filters],
  platformDistribution: (filters) => ['platformDistribution', filters],
  timeSeries: (filters) => ['timeSeries', filters],
  topMentions: (filters) => ['topMentions', filters],
  sentimentByTopics: (filters) => ['sentimentByTopics', filters],
  cache: ['cache'],
};

// API fetch functions
const fetchPublicMentions = async (filters, page = 1) => {
  const params = new URLSearchParams({
    days: filters.days.toString(),
    platform: filters.platform,
    sentiment: filters.sentiment,
    topic: filters.topic,
    page: page.toString(),
    limit: "10000",
  });

  const response = await fetch(`/api/public-mentions?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }
  return response.json();
};

const fetchMentions = async (filters) => {
  const params = new URLSearchParams({
    days: filters.days?.toString() || '30',
    platform: filters.platform || 'all',
    sentiment: filters.sentiment || 'all',
    topic: filters.topic || 'all',
  });

  const response = await fetch(`/api/mentions?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch mentions: ${response.statusText}`);
  }
  return response.json();
};

const fetchDashboardSummary = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/dashboard-summary?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard summary: ${response.statusText}`);
  }
  return response.json();
};

const fetchSentimentDistribution = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/sentiment-distribution?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sentiment distribution: ${response.statusText}`);
  }
  return response.json();
};

const fetchPlatformDistribution = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/platform-distribution?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch platform distribution: ${response.statusText}`);
  }
  return response.json();
};

const fetchTimeSeries = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/time-series?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch time series: ${response.statusText}`);
  }
  return response.json();
};

const fetchTopMentions = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/top-mentions?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch top mentions: ${response.statusText}`);
  }
  return response.json();
};

const fetchSentimentByTopics = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if ((filters as any)?.sentiments?.length > 0) {
    params.append('sentiments', (filters as any).sentiments.join(','));
  }
  
  if ((filters as any)?.sources?.length > 0) {
    params.append('sources', (filters as any).sources.join(','));
  }
  
  if ((filters as any)?.topics?.length > 0) {
    params.append('topics', (filters as any).topics.join(','));
  }
  
  if ((filters as any)?.dateRange?.from) {
    params.append('date_from', (filters as any).dateRange.from);
  }
  
  if ((filters as any)?.dateRange?.to) {
    params.append('date_to', (filters as any).dateRange.to);
  }

  const response = await fetch(`/api/social-media/sentiment-by-topics?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch sentiment by topics data');
  }
  
  return response.json();
};

const fetchCacheStats = async () => {
  const response = await fetch('/api/cache?action=stats');
  if (!response.ok) {
    throw new Error(`Failed to fetch cache stats: ${response.statusText}`);
  }
  return response.json();
};

// Custom hooks
export const usePublicMentions = (filters, options = {}) => {
  return useQuery({
    queryKey: queryKeys.publicMentions(filters),
    queryFn: () => fetchPublicMentions(filters),
    enabled: !!filters,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Infinite query for pagination
export const useInfinitePublicMentions = (filters, options = {}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.publicMentions(filters),
    queryFn: ({ pageParam = 1 }) => fetchPublicMentions(filters, pageParam as number),
    enabled: !!filters,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.meta?.pagination?.hasNextPage) {
        return lastPage.meta.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 0, // Always refetch when filters change
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    ...options,
  });
};

export const useMentions = (filters, options = {}) => {
  return useQuery({
    queryKey: ['mentions', filters], // Include filters in query key
    queryFn: () => fetchMentions(filters),
    enabled: !!filters,
    staleTime: 0, // Always refetch when filters change
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    ...options,
  });
};

export const useDashboardSummary = (filters, options = {}) => {
  return useQuery({
    queryKey: queryKeys.dashboardSummary(filters),
    queryFn: () => fetchDashboardSummary(filters),
    enabled: !!filters,
    staleTime: 0, // Always refetch when filters change
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    ...options,
  });
};

export const useSentimentDistribution = (filters, options = {}) => {
  return useQuery({
    queryKey: queryKeys.sentimentDistribution(filters),
    queryFn: () => fetchSentimentDistribution(filters),
    enabled: !!filters,
    staleTime: 0, // Always refetch when filters change
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    ...options,
  });
};

export const usePlatformDistribution = (filters, options = {}) => {
  return useQuery({
    queryKey: queryKeys.platformDistribution(filters),
    queryFn: () => fetchPlatformDistribution(filters),
    enabled: !!filters,
    staleTime: 0, // Always refetch when filters change
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    ...options,
  });
};

export const useTimeSeries = (filters, options = {}) => {
  return useQuery({
    queryKey: queryKeys.timeSeries(filters),
    queryFn: () => fetchTimeSeries(filters),
    enabled: !!filters,
    staleTime: 0, // Always refetch when filters change
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    ...options,
  });
};

export const useTopMentions = (filters, options = {}) => {
  return useQuery({
    queryKey: queryKeys.topMentions(filters),
    queryFn: () => fetchTopMentions(filters),
    enabled: !!filters,
    staleTime: 0, // Always refetch when filters change
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    ...options,
  });
};

export const useSentimentByTopics = (filters, options = {}) => {
  return useQuery({
    queryKey: queryKeys.sentimentByTopics(filters),
    queryFn: () => fetchSentimentByTopics(filters),
    enabled: !!filters,
    staleTime: 0, // Always refetch when filters change
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    ...options,
  });
};

export const useCacheStats = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.cache,
    queryFn: fetchCacheStats,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    ...options,
  });
};
