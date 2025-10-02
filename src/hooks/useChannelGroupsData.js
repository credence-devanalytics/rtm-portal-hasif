import { useQuery } from '@tanstack/react-query';

const fetchChannelGroupsData = async (filterType = 'all') => {
  const response = await fetch(`/api/channel-groups?type=${filterType}`);
  if (!response.ok) {
    throw new Error('Failed to fetch channel groups data');
  }
  return response.json();
};

export const useChannelGroupsData = (filterType = 'all') => {
  return useQuery({
    queryKey: ['channel-groups-data', filterType],
    queryFn: () => fetchChannelGroupsData(filterType),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Specific hook for radio channel groups only
export const useRadioChannelGroupsData = () => {
  return useChannelGroupsData('radio');
};

// Specific hook for TV channel groups only
export const useTVChannelGroupsData = () => {
  return useChannelGroupsData('tv');
};

// Specific hook for news channel groups only
export const useNewsChannelGroupsData = () => {
  return useChannelGroupsData('news');
};

// Specific hook for official channel groups only
export const useOfficialChannelGroupsData = () => {
  return useChannelGroupsData('official');
};