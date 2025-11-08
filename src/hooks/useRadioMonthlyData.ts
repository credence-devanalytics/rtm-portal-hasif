import { useQuery } from '@tanstack/react-query';

const fetchRadioMonthlyData = async (filterParam?: string | null) => {
  const url = filterParam
    ? `/api/radio-monthly?${filterParam}`
    : '/api/radio-monthly';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch radio monthly data');
  }
  return response.json();
};

export const useRadioMonthlyData = (filterParam?: string | null) => {
  return useQuery({
    queryKey: ['radio-monthly-data', filterParam],
    queryFn: () => fetchRadioMonthlyData(filterParam),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
