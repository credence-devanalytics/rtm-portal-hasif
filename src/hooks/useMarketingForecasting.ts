import { useQuery } from '@tanstack/react-query';

export interface ForecastingChannelData {
  historical: number[];
  forecast: number;
  confidenceInterval: {
    upper: number;
    lower: number;
  };
  growthRate: number;
}

export interface ForecastingData {
  channels: {
    TV?: ForecastingChannelData;
    RADIO?: ForecastingChannelData;
    BES?: ForecastingChannelData;
  };
  metadata: {
    reportTitle: string;
    historicalYears: number[];
    forecastYear: number;
    currency: string;
  };
  summary: {
    totalRevenue: {
      2022: number;
      2023: number;
      2024: number;
      forecast2025: number;
    };
    overallGrowthRate: number;
    formattedRevenue: {
      2022: string;
      2023: string;
      2024: string;
      forecast2025: string;
    };
  };
}

export interface ForecastingApiResponse {
  success: boolean;
  data: ForecastingData;
  error?: string;
  details?: string;
}

export const useMarketingForecasting = () => {
  return useQuery<ForecastingApiResponse>({
    queryKey: ['marketing-forecasting'],
    queryFn: async (): Promise<ForecastingApiResponse> => {
      const response = await fetch('/api/marketing-forecasting');

      if (!response.ok) {
        throw new Error(`Failed to fetch marketing forecasting data: ${response.statusText}`);
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