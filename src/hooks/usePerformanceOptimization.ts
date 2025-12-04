import React, { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Performance optimization hook
export const usePerformanceOptimization = () => {
  const queryClient = useQueryClient();

  // Debounce function to reduce API calls
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  // Memoized query options for better caching
  const getQueryOptions = useCallback((staleTime = 5 * 60 * 1000, cacheTime = 10 * 60 * 1000) => ({
    staleTime,
    cacheTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  }), []);

  // Prefetch critical data
  const prefetchCriticalData = useCallback(async () => {
    // Prefetch products data
    await queryClient.prefetchQuery({
      queryKey: ['products'],
      queryFn: () => import('@/api/products').then(module => module.fetchProducts()),
      ...getQueryOptions(10 * 60 * 1000, 30 * 60 * 1000), // 10 min stale, 30 min cache
    });
  }, [queryClient, getQueryOptions]);

  // Optimize image loading
  const optimizeImageLoading = useCallback((src: string, priority = false) => {
    if (priority) {
      // Preload critical images
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    }
  }, []);

  // Batch API calls to reduce network requests
  const batchApiCalls = useCallback(async (calls: (() => Promise<any>)[]) => {
    try {
      const results = await Promise.allSettled(calls);
      return results.map(result => 
        result.status === 'fulfilled' ? result.value : null
      );
    } catch (error) {
      return [];
    }
  }, []);

  // Optimize component rendering
  const shouldRender = useCallback((condition: boolean, fallback: any = null) => {
    return condition ? true : fallback;
  }, []);

  // Memory optimization for large lists
  const optimizeListRendering = useCallback((items: any[], maxVisible = 20) => {
    return useMemo(() => {
      if (items.length <= maxVisible) return items;
      
      // Return only visible items for initial render
      return items.slice(0, maxVisible);
    }, [items, maxVisible]);
  }, []);

  return {
    debounce,
    getQueryOptions,
    prefetchCriticalData,
    optimizeImageLoading,
    batchApiCalls,
    shouldRender,
    optimizeListRendering,
  };
};


