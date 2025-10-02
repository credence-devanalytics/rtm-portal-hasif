import { useState, useEffect } from 'react';

export const useMultiplatformData = (filters) => {
  const [data, setData] = useState({
    unifiViewership: null,
    unifiSummary: null,
    mytvViewership: null,
    mytvAnalysis: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.monthYear) queryParams.set('monthYear', filters.monthYear);
      if (filters.channels?.length > 0) queryParams.set('channel', filters.channels.join(','));
      if (filters.region && filters.region !== 'all') queryParams.set('region', filters.region);

      // Fetch data from all APIs concurrently
      const [unifiViewershipRes, unifiSummaryRes, mytvViewershipRes, mytvAnalysisRes] = await Promise.allSettled([
        fetch(`/api/multiplatform?${queryParams}`).then(res => res.ok ? res.json() : null),
        fetch(`/api/unifi-summary?${queryParams}`).then(res => res.ok ? res.json() : null),
        fetch(`/api/mytv-viewership?${queryParams}`).then(res => res.ok ? res.json() : null),
        fetch(`/api/mytv-analysis?${queryParams}`).then(res => res.ok ? res.json() : null)
      ]);

      setData({
        unifiViewership: unifiViewershipRes.status === 'fulfilled' ? unifiViewershipRes.value : null,
        unifiSummary: unifiSummaryRes.status === 'fulfilled' ? unifiSummaryRes.value : null,
        mytvViewership: mytvViewershipRes.status === 'fulfilled' ? mytvViewershipRes.value : null,
        mytvAnalysis: mytvAnalysisRes.status === 'fulfilled' ? mytvAnalysisRes.value : null
      });

    } catch (err) {
      setError(err.message);
      console.error('Error fetching multiplatform data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.monthYear, filters.channels, filters.region, filters.platforms]);

  return { data, loading, error, refetch: fetchData };
};

export default useMultiplatformData;
