/**
 * Custom hooks for KPI data fetching using TanStack Query
 */

import { useQuery } from '@tanstack/react-query';

interface KPIResponse {
  success: boolean;
  data: {
    mau_total?: number;
    total_reach?: number;
    tv_reach?: number;
    radio_reach?: number;
    totalActiveUsers?: number;
    totalAudience?: number;
    year?: number;
  };
}

// Fetch UnifiTV KPI
export function useUnifiTVKPI() {
  return useQuery<KPIResponse>({
    queryKey: ['kpi', 'unifitv'],
    queryFn: async () => {
      const response = await fetch('/api/kpi/unifitv');
      if (!response.ok) throw new Error('Failed to fetch UnifiTV KPI');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  });
}

// Fetch MyTV KPI
export function useMyTVKPI() {
  return useQuery<KPIResponse>({
    queryKey: ['kpi', 'mytv'],
    queryFn: async () => {
      const response = await fetch('/api/kpi/mytv');
      if (!response.ok) throw new Error('Failed to fetch MyTV KPI');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Fetch ASTRO KPI
export function useASTROKPI() {
  return useQuery<KPIResponse>({
    queryKey: ['kpi', 'astro'],
    queryFn: async () => {
      const response = await fetch('/api/kpi/astro');
      if (!response.ok) throw new Error('Failed to fetch ASTRO KPI');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Fetch RTMKlik KPI
export function useRTMKlikKPI() {
  return useQuery<KPIResponse>({
    queryKey: ['kpi', 'rtmklik'],
    queryFn: async () => {
      const response = await fetch('/api/kpi/rtmklik');
      if (!response.ok) throw new Error('Failed to fetch RTMKlik KPI');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Fetch Portal Berita KPI
export function usePortalBeritaKPI() {
  return useQuery<KPIResponse>({
    queryKey: ['kpi', 'portal-berita'],
    queryFn: async () => {
      const response = await fetch('/api/kpi/portal-berita');
      if (!response.ok) throw new Error('Failed to fetch Portal Berita KPI');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
