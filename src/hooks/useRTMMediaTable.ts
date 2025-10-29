import { useQuery } from "@tanstack/react-query";

interface RTMMediaTableFilters {
	from: string;
	to: string;
	platform?: string;
	channel?: string;
	unit?: string;
}

interface RTMMediaTableRow {
	name: string;
	totalPosts: number;
	totalReach: number;
	totalEngagement: number;
}

interface RTMMediaTableData {
	data: RTMMediaTableRow[];
	type: "units" | "channels";
	unit: string | null;
	meta?: any;
}

const fetchMediaTable = async (filters: RTMMediaTableFilters): Promise<RTMMediaTableData> => {
	const queryParams = new URLSearchParams({
		from: filters.from || "",
		to: filters.to || "",
		platform: filters.platform || "",
		channel: filters.channel || "",
		unit: filters.unit || "",
	});

	console.log("🔄 Fetching RTM Media Table with filters:", Object.fromEntries(queryParams));
	console.log("🌐 API URL:", `/api/rtm-media-table?${queryParams}`);

	const fetchStartTime = Date.now();
	const response = await fetch(`/api/rtm-media-table?${queryParams}`);
	console.log(`⏱️ Fetch took ${Date.now() - fetchStartTime}ms`);

	if (!response.ok) {
		const errorText = await response.text();
		console.error("❌ Response not OK:", response.status, errorText);
		throw new Error(`API request failed: ${response.statusText}`);
	}

	const result = await response.json();
	console.log("✅ RTM Media Table received:", result);
	console.log("📊 Data count:", result.data?.length, "Type:", result.type);
	console.log("📋 First row sample:", result.data?.[0]);
	console.log("📋 All data:", JSON.stringify(result.data, null, 2));

	return result;
};

export const useRTMMediaTable = (filters: RTMMediaTableFilters) => {
	const queryKey = ['rtm-media-table', filters];

	const { data, isLoading, error, refetch } = useQuery({
		queryKey,
		queryFn: () => fetchMediaTable(filters),
		staleTime: 2 * 60 * 1000, // Data stays fresh for 2 minutes (reduced for faster updates)
		gcTime: 5 * 60 * 1000, // Cache for 5 minutes
		retry: 1, // Retry failed requests once
		refetchOnWindowFocus: false, // Don't refetch when window regains focus
		placeholderData: (previousData) => previousData, // Keep previous data while fetching
	});

	return { 
		data: data ?? null, // Return null instead of undefined for consistency
		isLoading, 
		error: error as Error | null, 
		refetch 
	};
};
