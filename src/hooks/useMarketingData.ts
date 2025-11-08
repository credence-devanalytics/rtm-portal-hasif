import { useQuery } from '@tanstack/react-query';

export const useMarketingData = (filterParam?: string | null) => {
  return useQuery({
    queryKey: ['marketing-analysis', filterParam],
    queryFn: async () => {
      const url = filterParam
        ? `/api/marketing-analysis?${filterParam}`
        : '/api/marketing-analysis';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch marketing data');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
