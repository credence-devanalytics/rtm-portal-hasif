import { useQuery } from "@tanstack/react-query";

interface RTMUnitsChannelsFilters {
	from: string;
	to: string;
	platform?: string;
	author?: string;
	unit?: string; // Add unit filter
}

interface RTMUnitRow {
	name: string;
	totalPosts: number;
}

interface RTMChannelRow {
	groupname: string;
	name: string;
	unit: string;
	totalPosts: number;
}

interface RTMUnitsChannelsData {
	units: {
		data: RTMUnitRow[];
		total: number;
	};
	channels: {
		data: RTMChannelRow[];
		total: number;
	};
	meta?: any;
}

const fetchUnitsChannels = async (filters: RTMUnitsChannelsFilters): Promise<RTMUnitsChannelsData> => {
	const queryParams = new URLSearchParams({
		from: filters.from || "",
		to: filters.to || "",
		platform: filters.platform || "",
		author: filters.author || "",
		unit: filters.unit || "", // Add unit parameter
	});

	console.log("🔄 Fetching RTM Units & Channels with filters:", Object.fromEntries(queryParams));
	console.log("🌐 API URL:", `/api/rtm-units-channels?${queryParams}`);

	const fetchStartTime = Date.now();
	const response = await fetch(`/api/rtm-units-channels?${queryParams}`);
	console.log(`⏱️ Fetch took ${Date.now() - fetchStartTime}ms`);

	if (!response.ok) {
		const errorText = await response.text();
		console.error("❌ Response not OK:", response.status, errorText);
		throw new Error(`API request failed: ${response.statusText}`);
	}

	const result = await response.json();
	console.log("✅ RTM Units & Channels received:", result);
	console.log("📊 Units count:", result.units?.data?.length);
	console.log("📊 Channels count:", result.channels?.data?.length);
	console.log("📋 First unit sample:", result.units?.data?.[0]);
	console.log("📋 First channel sample:", result.channels?.data?.[0]);

	return result;
};

export const useRTMUnitsChannels = (filters: RTMUnitsChannelsFilters) => {
	const queryKey = ['rtm-units-channels', filters];

	const { data, isLoading, error, refetch } = useQuery({
		queryKey,
		queryFn: () => fetchUnitsChannels(filters),
		staleTime: 2 * 60 * 1000, // Data stays fresh for 2 minutes
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
