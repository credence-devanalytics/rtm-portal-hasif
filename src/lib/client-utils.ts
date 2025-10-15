/**
 * Utility to safely handle client-side only operations
 */
import React from 'react';

export const isClient = typeof window !== 'undefined';

export const safeWindow = isClient ? window : undefined;

export const safeLocation = isClient ? window.location : undefined;

/**
 * Hook to safely use client-side only values
 */
export function useClientOnly<T>(clientValue: T, serverValue: T) {
  return isClient ? clientValue : serverValue;
}

/**
 * Component wrapper that only renders on client-side
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return React.createElement(React.Fragment, null, children);
}
