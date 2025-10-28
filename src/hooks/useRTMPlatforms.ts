import { useQuery } from "@tanstack/react-query";

interface RTMPlatformsFilters {
	from: string;
	to: string;
	platform?: string;
	author?: string;
	unit?: string;
}

interface PlatformData {
	platform: string;
	count: number;
}

interface RTMPlatformsResponse {
	data: PlatformData[];
	meta: {
		queryDate: string;
		filters: RTMPlatformsFilters;
		totalPosts: number;
	};
}

const fetchPlatforms = async (filters: RTMPlatformsFilters): Promise<RTMPlatformsResponse> => {
	const queryParams = new URLSearchParams({
		from: filters.from || "",
		to: filters.to || "",
		platform: filters.platform || "",
		author: filters.author || "",
		unit: filters.unit || "",
	});

	console.log("🔄 Fetching RTM Platforms with filters:", Object.fromEntries(queryParams));
	console.log("🌐 API URL:", `/api/rtm-platforms?${queryParams}`);

	const fetchStartTime = Date.now();
	const response = await fetch(`/api/rtm-platforms?${queryParams}`);
	console.log(`⏱️ Fetch took ${Date.now() - fetchStartTime}ms`);

	if (!response.ok) {
		const errorText = await response.text();
		console.error("❌ Response not OK:", response.status, errorText);
		throw new Error(`API request failed: ${response.statusText}`);
	}

	const result = await response.json();
	console.log("✅ RTM Platforms received:", result);
	console.log("📊 Platforms count:", result.data?.length);
	console.log("📊 Total posts:", result.meta?.totalPosts);

	return result;
};

export const useRTMPlatforms = (filters: RTMPlatformsFilters) => {
	const queryKey = ['rtm-platforms', filters];

	const { data, isLoading, error, refetch } = useQuery({
		queryKey,
		queryFn: () => fetchPlatforms(filters),
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
		refetch 
	};
};
