import { useQuery } from '@tanstack/react-query';

const fetchRadioChannelsData = async () => {
  const response = await fetch('/api/radio-channels');
  if (!response.ok) {
    throw new Error('Failed to fetch radio channels data');
  }
  return response.json();
};

export const useRadioChannelsData = () => {
  return useQuery({
    queryKey: ['radio-channels-data'],
    queryFn: fetchRadioChannelsData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
