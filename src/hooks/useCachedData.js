/**
 * Custom React hooks for cached dashboard data
 * Provides easy integration with the cached API endpoints
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Base hook for API calls with caching awareness
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @param {Object} options - Hook options
 */
function useApiData(endpoint, params = {}, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  
  const {
    autoFetch = true,
    refreshInterval = null,
    onSuccess = null,
    onError = null
  } = options;
  
  const fetchData = useCallback(async () => {
    if (!endpoint) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const queryString = new URLSearchParams(
        Object.entries(params).filter(([_, value]) => value !== null && value !== undefined)
      ).toString();
      
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      setData(result);
      setCacheInfo(result._cache || null);
      
      if (onSuccess) onSuccess(result);
      
    } catch (err) {
      console.error(`API Error for ${endpoint}:`, err);
      setError(err.message);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, params, onSuccess, onError]);
  
  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);
  
  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);
  
  return {
    data,
    loading,
    error,
    cacheInfo,
    refetch: fetchData,
    isFromCache: cacheInfo?.hit || false,
    cacheKey: cacheInfo?.key || null,
    responseTime: cacheInfo?.responseTime || null
  };
}

/**
 * Hook for dashboard summary data
 */
export function useDashboardSummary(filters = {}, options = {}) {
  return useApiData('/api/dashboard-summary', filters, {
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    ...options
  });
}

/**
 * Hook for sentiment distribution data
 */
export function useSentimentDistribution(filters = {}, options = {}) {
  return useApiData('/api/sentiment-distribution', filters, {
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    ...options
  });
}

/**
 * Hook for platform distribution data
 */
export function usePlatformDistribution(filters = {}, options = {}) {
  return useApiData('/api/platform-distribution', filters, {
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    ...options
  });
}

/**
 * Hook for time series data
 */
export function useTimeSeries(filters = {}, granularity = 'daily', options = {}) {
  const params = { ...filters, granularity };
  
  return useApiData('/api/time-series', params, {
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    ...options
  });
}

/**
 * Hook for top mentions data with pagination
 */
export function useTopMentions(filters = {}, sorting = {}, pagination = {}, options = {}) {
  const params = {
    ...filters,
    sortBy: sorting.sortBy || 'reach',
    sortOrder: sorting.sortOrder || 'desc',
    page: pagination.page || 1,
    pageSize: pagination.pageSize || 50
  };
  
  return useApiData('/api/top-mentions', params, {
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    ...options
  });
}

/**
 * Hook for cache management
 */
export function useCacheManager() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cache?action=stats');
      if (!response.ok) throw new Error('Failed to fetch cache stats');
      const result = await response.json();
      setStats(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cache?action=health');
      if (!response.ok) throw new Error('Failed to fetch cache health');
      const result = await response.json();
      setHealth(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const clearCache = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cache?confirm=true', { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to clear cache');
      const result = await response.json();
      
      // Refresh stats after clearing
      await fetchStats();
      await fetchHealth();
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchHealth]);
  
  return {
    stats,
    health,
    loading,
    error,
    fetchStats,
    fetchHealth,
    clearCache
  };
}

/**
 * Hook for managing filter state across components
 */
export function useDashboardFilters(initialFilters = {}) {
  const [filters, setFilters] = useState({
    days: '30',
    platform: 'all',
    unit: 'all',
    fromDate: null,
    toDate: null,
    sentiment: 'all',
    ...initialFilters
  });
  
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);
  
  const resetFilters = useCallback(() => {
    setFilters({
      days: '30',
      platform: 'all',
      unit: 'all',
      fromDate: null,
      toDate: null,
      sentiment: 'all',
      ...initialFilters
    });
  }, [initialFilters]);
  
  // Generate cache-friendly filter object (removes null/undefined values)
  const cleanFilters = useCallback(() => {
    return Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '' && value !== 'all') {
        acc[key] = value;
      }
      return acc;
    }, {});
  }, [filters]);
  
  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    cleanFilters: cleanFilters()
  };
}

/**
 * Hook for real-time cache monitoring
 */
export function useCacheMonitor(interval = 30000) { // 30 seconds
  const [cacheStats, setCacheStats] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const { fetchStats, fetchHealth } = useCacheManager();
  
  useEffect(() => {
    if (isMonitoring) {
      const monitor = setInterval(async () => {
        try {
          await fetchStats();
          await fetchHealth();
        } catch (error) {
          console.error('Cache monitoring error:', error);
        }
      }, interval);
      
      return () => clearInterval(monitor);
    }
  }, [isMonitoring, interval, fetchStats, fetchHealth]);
  
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);
  
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);
  
  return {
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    cacheStats
  };
}

/**
 * Example usage component with cache performance display
 */
export function CachePerformanceIndicator({ cacheInfo, title }) {
  if (!cacheInfo) return (
    <div className="text-xs text-gray-400 p-2 bg-gray-50 rounded">
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-gray-300"></span>
        <span>{title || 'Cache'}: No data</span>
      </div>
    </div>
  );
  
  return (
    <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
      <div className="flex items-center gap-2 mb-1">
        <span className={`inline-block w-2 h-2 rounded-full ${
          cacheInfo.hit ? 'bg-green-500' : 'bg-yellow-500'
        }`}></span>
        <span className="font-medium">
          {title || 'Cache'}: {cacheInfo.hit ? 'HIT' : 'MISS'}
        </span>
      </div>
      <div className="text-gray-500">
        <div>Response: {cacheInfo.responseTime}ms</div>
        {cacheInfo.key && (
          <div>Key: {cacheInfo.key.substring(0, 8)}...</div>
        )}
      </div>
    </div>
  );
}

// Export all hooks
export default {
  useDashboardSummary,
  useSentimentDistribution,
  usePlatformDistribution,
  useTimeSeries,
  useTopMentions,
  useCacheManager,
  useDashboardFilters,
  useCacheMonitor,
  CachePerformanceIndicator
};
