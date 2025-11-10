import { useQuery } from '@tanstack/react-query';

export const useTVMonthlyData = (filterParam?: string | null) => {
  return useQuery({
    queryKey: ['tv-monthly', filterParam],
    queryFn: async () => {
      const url = filterParam
        ? `/api/tv-monthly?${filterParam}`
        : '/api/tv-monthly';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch TV monthly data');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
