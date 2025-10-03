import { useQuery } from '@tanstack/react-query';

const fetchRadioMonthlyData = async () => {
  const response = await fetch('/api/radio-monthly');
  if (!response.ok) {
    throw new Error('Failed to fetch radio monthly data');
  }
  return response.json();
};

export const useRadioMonthlyData = () => {
  return useQuery({
    queryKey: ['radio-monthly-data'],
    queryFn: fetchRadioMonthlyData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
