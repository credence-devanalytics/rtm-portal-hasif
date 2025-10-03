import { useQuery } from '@tanstack/react-query';

export const useMarketingData = () => {
  return useQuery({
    queryKey: ['marketing-analysis'],
    queryFn: async () => {
      const response = await fetch('/api/marketing-analysis');
      if (!response.ok) {
        throw new Error('Failed to fetch marketing data');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
