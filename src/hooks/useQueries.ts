import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

// Query keys factory for better organization
export const queryKeys = {
	mentions: ["mentions"],
	publicMentions: (filters) => ["publicMentions", filters],
	dashboardSummary: (filters) => ["dashboardSummary", filters],
	sentimentDistribution: (filters) => ["sentimentDistribution", filters],
	platformDistribution: (filters) => ["platformDistribution", filters],
	timeSeries: (filters) => ["timeSeries", filters],
	topMentions: (filters) => ["topMentions", filters],
	sentimentByTopics: (filters) => ["sentimentByTopics", filters],
	cache: ["cache"],
};

// API fetch functions
const fetchPublicMentions = async (filters, page = 1) => {
	const params = new URLSearchParams();
	params.append("days", filters.days.toString());
	params.append("page", Math.max(1, page).toString());
	params.append("limit", "50"); // Reasonable default for UI pagination

	// Only add optional filters if they exist
	if (
		filters.platform &&
		filters.platform !== "all" &&
		filters.platform !== "undefined"
	) {
		params.append("platform", filters.platform);
	}
	if (
		filters.sentiment &&
		filters.sentiment !== "all" &&
		filters.sentiment !== "undefined"
	) {
		params.append("sentiment", filters.sentiment);
	}
	if (filters.topic && filters.topic !== "undefined") {
		params.append("topic", filters.topic);
	}

	const url = `/api/public-mentions?${params}`;

	try {
		const response = await fetch(url);

		if (!response.ok) {
			// Log more detailed error information
			console.error("API Request failed:", {
				url,
				status: response.status,
				statusText: response.statusText,
				page,
				limit: 50,
			});

			// Try to get error details from response
			let errorMessage = `Failed to fetch data: ${response.statusText}`;
			try {
				const errorData = await response.json();
				errorMessage = errorData.details || errorMessage;
			} catch (e) {
				// If we can't parse error JSON, use status text
			}

			throw new Error(errorMessage);
		}

		const data = await response.json();

		// Enhanced response validation and logging
		console.log("📥 Raw API Response received:", {
			responseType: typeof data,
			hasMentions: !!data?.mentions,
			mentionsType: typeof data?.mentions,
			mentionsLength: Array.isArray(data?.mentions)
				? data.mentions.length
				: "not array",
			hasMetrics: !!data?.metrics,
			metricsType: typeof data?.metrics,
			metricsKeys: data?.metrics ? Object.keys(data.metrics) : [],
			hasMeta: !!data?.meta,
			metaKeys: data?.meta ? Object.keys(data.meta) : [],
		});

		// Log metrics specifically
		if (data?.metrics) {
			console.log("📊 Metrics in response:", {
				totalMentions: data.metrics.totalMentions,
				totalReach: data.metrics.totalReach,
				totalInteractions: data.metrics.totalInteractions,
				avgEngagement: data.metrics.avgEngagement,
				avgConfidence: data.metrics.avgConfidence,
			});
		} else {
			console.warn("⚠️ No metrics found in API response!");
		}

		// Validate response structure
		if (!data || typeof data !== "object") {
			throw new Error("Invalid response format: Expected object");
		}

		if (!Array.isArray(data.mentions)) {
			throw new Error("Invalid response format: Expected mentions array");
		}

		if (page === 1) {
			console.log("✅ Successfully fetched mentions:", {
				totalCount: data.meta?.pagination?.total || "unknown",
				currentPage: page,
				returnedCount: data.mentions.length,
				filters,
				metricsVerified: !!data?.metrics,
			});
		}

		return data;
	} catch (error) {
		console.error("Error in fetchPublicMentions:", {
			error: error.message,
			url,
			page,
			filters,
		});
		throw error;
	}
};

const fetchMentions = async (filters) => {
	const params = new URLSearchParams({
		days: filters.days?.toString() || "30",
		platform: filters.platform || "all",
		sentiment: filters.sentiment || "all",
		topic: filters.topic || "all",
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
		throw new Error(
			`Failed to fetch dashboard summary: ${response.statusText}`
		);
	}
	return response.json();
};

const fetchSentimentDistribution = async (filters) => {
	const params = new URLSearchParams(filters);
	const response = await fetch(`/api/sentiment-distribution?${params}`);
	if (!response.ok) {
		throw new Error(
			`Failed to fetch sentiment distribution: ${response.statusText}`
		);
	}
	return response.json();
};

const fetchPlatformDistribution = async (filters) => {
	const params = new URLSearchParams(filters);
	const response = await fetch(`/api/platform-distribution?${params}`);
	if (!response.ok) {
		throw new Error(
			`Failed to fetch platform distribution: ${response.statusText}`
		);
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
		params.append("sentiments", (filters as any).sentiments.join(","));
	}

	if ((filters as any)?.sources?.length > 0) {
		params.append("sources", (filters as any).sources.join(","));
	}

	if ((filters as any)?.topics?.length > 0) {
		params.append("topics", (filters as any).topics.join(","));
	}

	if ((filters as any)?.dateRange?.from) {
		params.append("date_from", (filters as any).dateRange.from);
	}

	if ((filters as any)?.dateRange?.to) {
		params.append("date_to", (filters as any).dateRange.to);
	}

	const response = await fetch(
		`/api/social-media/sentiment-by-topics?${params}`
	);

	if (!response.ok) {
		throw new Error("Failed to fetch sentiment by topics data");
	}

	return response.json();
};

const fetchCacheStats = async () => {
	const response = await fetch("/api/cache?action=stats");
	if (!response.ok) {
		throw new Error(`Failed to fetch cache stats: ${response.statusText}`);
	}
	return response.json();
};

const fetchRecommendations = async () => {
	const response = await fetch("/api/recommendations", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(
			errorData.details ||
				`Failed to fetch recommendations: ${response.statusText}`
		);
	}

	return response.json();
};

// Custom hooks
export const usePublicMentions = (filters, options = {}) => {
	const queryKey = queryKeys.publicMentions(filters);
	console.log("🔍 usePublicMentions called with:", filters);
	console.log("🔍 Generated query key:", queryKey);
	console.log("🔍 Enabled condition:", !!filters && filters.days > 0);

	return useQuery({
		queryKey,
		queryFn: () => {
			console.log("🚀 fetchPublicMentions called with:", filters);
			return fetchPublicMentions(filters);
		},
		enabled: !!filters && filters.days > 0, // More specific enabled condition
		staleTime: 0, // Force refetch every time for debugging
		cacheTime: 1000, // Very short cache time for debugging
		refetchOnMount: "always", // Always refetch when component mounts
		refetchOnWindowFocus: false,
		onSuccess: (data) => {
			console.log("✅ usePublicMentions SUCCESS - received data:", {
				hasData: !!data,
				hasMetrics: !!data?.metrics,
				metricsKeys: data?.metrics ? Object.keys(data.metrics) : "none",
				totalMentions: data?.metrics?.totalMentions,
				totalReach: data?.metrics?.totalReach,
				totalInteractions: data?.metrics?.totalInteractions,
				avgEngagement: data?.metrics?.avgEngagement,
				mentionsCount: data?.mentions?.length,
				meta: data?.meta,
			});
		},
		onError: (error) => {
			console.error("❌ usePublicMentions ERROR:", error);
		},
		...options,
	});
};

// Infinite query for pagination
export const useInfinitePublicMentions = (filters, options = {}) => {
	console.log("🔄 useInfinitePublicMentions called with:", filters);
	const queryKey = queryKeys.publicMentionsInfinite(filters);
	console.log("🔄 Generated infinite query key:", queryKey);

	return useInfiniteQuery({
		queryKey: queryKeys.publicMentions(filters),
		queryFn: ({ pageParam = 1 }) =>
			fetchPublicMentions(filters, pageParam as number),
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
		queryKey: ["mentions", filters], // Include filters in query key
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

export const useRecommendations = (options = {}) => {
	return useQuery({
		queryKey: queryKeys.recommendations,
		queryFn: fetchRecommendations,
		staleTime: 5 * 60 * 1000, // 5 minutes cache
		cacheTime: 10 * 60 * 1000, // 10 minutes cache
		refetchOnWindowFocus: false,
		retry: 2, // Retry up to 2 times on failure
		...options,
	});
};
