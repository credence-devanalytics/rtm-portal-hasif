import { useQuery } from '@tanstack/react-query';

const fetchMarketingTable2Data = async () => {
  const response = await fetch('/api/marketing-table2');
  if (!response.ok) {
    throw new Error('Failed to fetch marketing table 2 data');
  }
  return response.json();
};

export const useMarketingTable2Data = () => {
  return useQuery({
    queryKey: ['marketing-table2'],
    queryFn: fetchMarketingTable2Data,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
