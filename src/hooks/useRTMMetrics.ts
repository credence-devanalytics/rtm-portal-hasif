import { useState, useEffect } from "react";

interface RTMMetricsFilters {
	from: string;
	to: string;
	platform?: string;
	author?: string;
	unit?: string;
}

interface RTMMetricsData {
	totalMentions: number;
	totalEngagements: number;
	totalReach: number;
	channelsByUnit: Array<{
		unit: string;
		totalChannels: number;
	}>;
	meta?: any;
}

export const useRTMMetrics = (filters: RTMMetricsFilters) => {
	const [data, setData] = useState<RTMMetricsData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const fetchMetrics = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const queryParams = new URLSearchParams({
					from: filters.from || "",
					to: filters.to || "",
					platform: filters.platform || "",
					author: filters.author || "",
					unit: filters.unit || "",
				});

				console.log("🔄 Fetching RTM metrics with filters:", Object.fromEntries(queryParams));

				const response = await fetch(`/api/rtm-metrics?${queryParams}`);

				if (!response.ok) {
					throw new Error(`API request failed: ${response.statusText}`);
				}

				const result = await response.json();

				console.log("✅ RTM metrics received:", result);

				setData(result);
			} catch (err) {
				console.error("❌ Error fetching RTM metrics:", err);
				setError(err as Error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchMetrics();
	}, [filters.from, filters.to, filters.platform, filters.author, filters.unit]);

	const refetch = () => {
		setIsLoading(true);
		setError(null);
		// Trigger re-fetch by updating a dependency
		const fetchMetrics = async () => {
			try {
				const queryParams = new URLSearchParams({
					from: filters.from || "",
					to: filters.to || "",
					platform: filters.platform || "",
					author: filters.author || "",
					unit: filters.unit || "",
				});

				const response = await fetch(`/api/rtm-metrics?${queryParams}`);
				if (!response.ok) {
					throw new Error(`API request failed: ${response.statusText}`);
				}
				const result = await response.json();
				setData(result);
			} catch (err) {
				setError(err as Error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchMetrics();
	};

	return { data, isLoading, error, refetch };
};
