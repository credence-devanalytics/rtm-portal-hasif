import { useQuery } from '@tanstack/react-query';

const fetchRadioChannelsData = async (filterParam?: string | null) => {
  const url = filterParam
    ? `/api/radio-channels?${filterParam}`
    : '/api/radio-channels';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch radio channels data');
  }
  return response.json();
};

export const useRadioChannelsData = (filterParam?: string | null) => {
  return useQuery({
    queryKey: ['radio-channels-data', filterParam],
    queryFn: () => fetchRadioChannelsData(filterParam),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
