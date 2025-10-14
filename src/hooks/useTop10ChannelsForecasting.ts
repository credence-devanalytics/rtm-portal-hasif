import { useQuery } from '@tanstack/react-query';

export interface Top10ChannelData {
	rank: number;
	channel: string;
	category: "TV" | "RADIO" | "BES";
	currentRevenue: number; // 2024 actual
	forecastRevenue: number; // 2025 forecast
	growthRate: number;
	confidenceInterval: {
		upper: number;
		lower: number;
	};
	historical: number[]; // [2022, 2023, 2024]
}

export interface Top10ChannelsData {
	channels: Top10ChannelData[];
	metadata: {
		reportTitle: string;
		historicalYears: number[];
		forecastYear: number;
		currency: string;
		totalChannels: number;
	};
	summary: {
		totalTop10Revenue: number;
		top3Concentration: number;
		averageGrowthRate: number;
		highestGrowthChannel: Top10ChannelData;
	};
}

export interface Top10ChannelsApiResponse {
	success: boolean;
	data: Top10ChannelsData;
	error?: string;
	details?: string;
}

export const useTop10ChannelsForecasting = () => {
	return useQuery<Top10ChannelsApiResponse>({
		queryKey: ['top10-channels-forecasting'],
		queryFn: async (): Promise<Top10ChannelsApiResponse> => {
			const response = await fetch('/api/top10-channels-forecasting');

			if (!response.ok) {
				throw new Error(`Failed to fetch top 10 channels forecasting data: ${response.statusText}`);
			}

			const data = await response.json();

			if (!data.success) {
				throw new Error(data.error || 'Unknown error occurred');
			}

			return data;
		},
		staleTime: 10 * 60 * 1000, // 10 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
	});
};