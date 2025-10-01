import { useQuery } from '@tanstack/react-query';

// Query key factory for RTM dashboard
export const rtmQueryKeys = {
  all: ['rtm'],
  mentions: (filters) => [...rtmQueryKeys.all, 'mentions', filters],
  metrics: (filters) => [...rtmQueryKeys.all, 'metrics', filters],
  timeline: (filters) => [...rtmQueryKeys.all, 'timeline', filters],
  platforms: (filters) => [...rtmQueryKeys.all, 'platforms', filters],
  units: (filters) => [...rtmQueryKeys.all, 'units', filters],
  engagement: (filters) => [...rtmQueryKeys.all, 'engagement', filters],
  sentiment: (filters) => [...rtmQueryKeys.all, 'sentiment', filters],
  popular: (filters) => [...rtmQueryKeys.all, 'popular', filters],
};

// Fetch functions
const fetchRTMMentions = async (filters) => {
  const queryParams = new URLSearchParams({
    days: filters.days?.toString() || '30',
    from: filters.from || '',
    to: filters.to || '',
    platform: filters.platform || '',
    unit: filters.unit || '',
    sentiment: filters.sentiment || '',
    limit: '20000',
  });

  const response = await fetch(`/api/mentions?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch RTM mentions');
  return response.json();
};

const fetchRTMMetrics = async (filters) => {
  const queryParams = new URLSearchParams(filters);
  const response = await fetch(`/api/mentions?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch RTM metrics');
  const data = await response.json();
  return data.metrics;
};

const fetchRTMTimeline = async (filters) => {
  const queryParams = new URLSearchParams(filters);
  const response = await fetch(`/api/mentions?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch RTM timeline');
  const data = await response.json();
  return data.timeSeries;
};

const fetchRTMPlatforms = async (filters) => {
  const queryParams = new URLSearchParams(filters);
  const response = await fetch(`/api/mentions?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch RTM platforms');
  const data = await response.json();
  return data.platforms;
};

// Optimized single hook for all RTM data
export const useRTMDashboardData = (filters, options = {}) => {
  return useQuery({
    queryKey: ['rtm-dashboard', JSON.stringify(filters)], // Stable cache key
    queryFn: () => fetchRTMMentions(filters), // Single API call
    enabled: !!filters,
    staleTime: 2 * 60 * 1000, // 2 minutes - don't refetch immediately
    gcTime: 10 * 60 * 1000, // 10 minutes cache (renamed from cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
  });
};

// Legacy hooks for backward compatibility (now use shared data)
export const useRTMMentions = (filters, options = {}) => {
  const { data, ...rest } = useRTMDashboardData(filters, options);
  return { 
    data: data, 
    ...rest 
  };
};

export const useRTMMetrics = (filters, options = {}) => {
  const { data, ...rest } = useRTMDashboardData(filters, options);
  return { 
    data: data?.metrics, 
    ...rest 
  };
};

export const useRTMTimeline = (filters, options = {}) => {
  const { data, ...rest } = useRTMDashboardData(filters, options);
  return { 
    data: data?.timeSeries, 
    ...rest 
  };
};

export const useRTMPlatforms = (filters, options = {}) => {
  const { data, ...rest } = useRTMDashboardData(filters, options);
  return { 
    data: data?.platforms, 
    ...rest 
  };
};

// Transform raw data function
export const transformRTMData = (rawData) => {
  if (!rawData?.mentions) return [];
  
  return rawData.mentions.map((row, index) => {
    let date = new Date();
    if (row.inserttime) {
      date = new Date(row.inserttime);
    } else if (row.insertdate) {
      date = new Date(row.insertdate);
    }

    let platform = "Other";
    if (row.type) {
      const type = row.type.toLowerCase();
      if (type.includes("facebook")) platform = "Facebook";
      else if (type.includes("instagram")) platform = "Instagram";
      else if (type.includes("twitter") || type.includes("x.com")) platform = "Twitter";
      else if (type.includes("tiktok")) platform = "TikTok";
      else if (type.includes("youtube")) platform = "YouTube";
      else if (type.includes("reddit")) platform = "Reddit";
      else if (type.includes("linkedin")) platform = "LinkedIn";
    }

    let unit = "Other";
    if (row.groupname) {
      const groupName = row.groupname.toLowerCase();
      if (groupName.includes("radio")) unit = "Radio";
      else if (groupName.includes("tv")) unit = "TV";
      else if (groupName.includes("berita") || groupName.includes("news")) unit = "News";
      else if (groupName.includes("official")) unit = "Official";
    }

    if (unit === "Other" && row.from) {
      const fromText = row.from.toLowerCase();
      if (fromText.includes("radio")) unit = "Radio";
      else if (fromText.includes("tv")) unit = "TV";
      else if (fromText.includes("berita") || fromText.includes("news")) unit = "News";
      else if (fromText.includes("official")) unit = "Official";
    }

    let sentiment = "neutral";
    const sentimentValue = (row.sentiment || row.autosentiment || "").toLowerCase();
    if (sentimentValue.includes("positive")) sentiment = "positive";
    else if (sentimentValue.includes("negative")) sentiment = "negative";

    const likeCount = Number(row.likecount || row.favoritecount || row.diggcount || row.lovecount || 0);
    const shareCount = Number(row.sharecount || row.retweetcount || 0);
    const commentCount = Number(row.commentcount || row.replycount || 0);
    const viewCount = Number(row.viewcount || row.playcount || 0);
    const totalReactions = Number(row.totalreactionscount || 0);
    const reach = Number(row.reach || 0);
    const followerCount = Number(row.followerscount || row.authorfollowercount || 0);
    const interactions = likeCount + shareCount + commentCount + totalReactions;
    const engagementRate = Number(row.engagementrate || (interactions / Math.max(reach, 1)) * 100);

    return {
      id: row.id || row.idpk || index,
      author: row.channel || `User${index}`,
      sentiment,
      category: row.topic || "General",
      date: date.toISOString().split("T")[0],
      datetime: row.inserttime || date.toISOString(),
      platform,
      unit,
      channel: row.channel,
      channelgroup: row.channelgroup,
      groupname: row.groupname,
      keywords: (row.keywords || "").toString(),
      likeCount,
      shareCount,
      commentCount,
      viewCount,
      totalReactions,
      interactions,
      reach,
      engagementRate,
      location: row.locations || "Malaysia",
      influenceScore: Number(row.influencescore || row.score || 0),
      followerCount,
      mentionSnippet: row.fullmention || row.mention || row.title || row.description || "No content available",
      postUrl: row.url || "#",
      isInfluencer: followerCount > 10000 || Number(row.influencescore || 0) > 80,
      originalData: row,
    };
  }).filter((item) => {
    return (
      item.date &&
      !isNaN(new Date(item.date)) &&
      item.mentionSnippet &&
      item.mentionSnippet !== "No content available"
    );
  });
};