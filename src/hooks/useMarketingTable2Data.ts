import { useQuery } from '@tanstack/react-query';

const fetchMarketingTable2Data = async (filterParam?: string | null) => {
  const url = filterParam
    ? `/api/marketing-table2?${filterParam}`
    : '/api/marketing-table2';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch marketing table 2 data');
  }
  return response.json();
};

export const useMarketingTable2Data = (filterParam?: string | null) => {
  return useQuery({
    queryKey: ['marketing-table2', filterParam],
    queryFn: () => fetchMarketingTable2Data(filterParam),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
