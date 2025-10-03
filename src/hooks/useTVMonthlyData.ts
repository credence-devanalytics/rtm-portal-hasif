import { useQuery } from '@tanstack/react-query';

export const useTVMonthlyData = () => {
  return useQuery({
    queryKey: ['tv-monthly'],
    queryFn: async () => {
      const response = await fetch('/api/tv-monthly');
      if (!response.ok) {
        throw new Error('Failed to fetch TV monthly data');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
